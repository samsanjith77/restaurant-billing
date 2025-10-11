import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import '../styles/components/Expenditure.css';

const Expenditure = () => {
  const [persons, setPersons] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null); // Store full response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('expenses');
  
  // Filter state
  const [filterType, setFilterType] = useState('today');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Add person form
  const [personForm, setPersonForm] = useState({
    name: '',
    role: 'worker',
    contact: ''
  });
  
  // Add expense form
  const [expenseForm, setExpenseForm] = useState({
    person_id: '',
    category: 'wage',
    description: '',
    amount: ''
  });

  // Load expenses - useCallback to memoize
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let payload = { filter_type: filterType };

      if (filterType === 'custom' && startDate && endDate) {
        payload = {
          filter_type: 'custom',
          start_date: startDate,
          end_date: endDate
        };
      }

      console.log('📅 Fetching expenses with payload:', payload);
      
      const data = await ApiService.filterExpenses(payload);
      
      console.log('✅ Received data:', data);

      // Handle nested response structure
      if (data && data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        setExpenseSummary(data);
      } else if (Array.isArray(data)) {
        // Fallback if API returns direct array
        setExpenses(data);
        setExpenseSummary(null);
      } else {
        console.error('❌ Unexpected data format:', data);
        setExpenses([]);
        setExpenseSummary(null);
      }
    } catch (err) {
      console.error('❌ Error loading expenses:', err);
      setError(err.message || 'Failed to load expenses');
      setExpenses([]);
      setExpenseSummary(null);
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  // Load persons
  const loadPersons = async () => {
    try {
      const data = await ApiService.getPersons();
      console.log('👥 Loaded persons:', data);
      setPersons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading persons:', err);
      setPersons([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPersons();
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload expenses when filter changes
  useEffect(() => {
    if (persons.length > 0) {
      loadExpenses();
    }
  }, [loadExpenses, persons.length]);

  // Add person
  const handleAddPerson = async (e) => {
    e.preventDefault();
    
    if (!personForm.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      await ApiService.addPerson(personForm);
      
      setMessage({ type: 'success', text: 'Person added successfully' });
      setPersonForm({ name: '', role: 'worker', contact: '' });
      
      await loadPersons();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add person' });
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!expenseForm.person_id || !expenseForm.amount) {
      setMessage({ type: 'error', text: 'Person and amount are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        person_id: parseInt(expenseForm.person_id),
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount)
      };

      console.log('💰 Adding expense:', payload);

      await ApiService.addExpense(payload);
      
      setMessage({ type: 'success', text: 'Expense added successfully' });
      setExpenseForm({ person_id: '', category: 'wage', description: '', amount: '' });
      
      await loadExpenses();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add expense' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const getTotalExpense = () => {
    // Use summary total if available
    if (expenseSummary && expenseSummary.total_amount) {
      if (selectedPerson === 'all') {
        return parseFloat(expenseSummary.total_amount);
      }
    }

    // Fallback: calculate from expenses
    if (!Array.isArray(expenses)) return 0;
    
    let filtered = expenses;
    
    if (selectedPerson !== 'all') {
      const selectedPersonObj = persons.find(p => p.id === parseInt(selectedPerson));
      if (selectedPersonObj) {
        filtered = expenses.filter(exp => exp.person === selectedPersonObj.name);
      }
    }
    
    return filtered.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  };

  const getExpensesByPerson = () => {
    if (!Array.isArray(expenses)) return [];
    
    const personExpenses = {};
    
    expenses.forEach(exp => {
      const personName = exp.person;
      if (!personExpenses[personName]) {
        personExpenses[personName] = {
          name: personName,
          role: exp.role || 'Worker',
          total: 0,
          count: 0
        };
      }
      personExpenses[personName].total += parseFloat(exp.amount || 0);
      personExpenses[personName].count++;
    });
    
    return Object.values(personExpenses);
  };

  const getFilteredExpenses = () => {
    if (!Array.isArray(expenses)) return [];
    
    if (selectedPerson === 'all') return expenses;
    
    const selectedPersonObj = persons.find(p => p.id === parseInt(selectedPerson));
    if (!selectedPersonObj) return expenses;
    
    return expenses.filter(exp => exp.person === selectedPersonObj.name);
  };

  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="expenditure">
      {/* Message Notification */}
      {message && (
        <div className={`notification notification--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1>Expenditure</h1>
        <p>Manage expenses and workers</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">₹</div>
          <div className="card-info">
            <span className="card-value">₹{getTotalExpense().toFixed(2)}</span>
            <span className="card-label">Total Expense</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">#</div>
          <div className="card-info">
            <span className="card-value">{filteredExpenses.length}</span>
            <span className="card-label">Transactions</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-info">
            <span className="card-value">{persons.length}</span>
            <span className="card-label">Workers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`tab ${activeTab === 'persons' ? 'active' : ''}`}
          onClick={() => setActiveTab('persons')}
        >
          Workers
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="expenses-tab">
            {/* Add Expense Form */}
            <div className="form-section">
              <h3>Add Expense</h3>
              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Worker *</label>
                    <select
                      value={expenseForm.person_id}
                      onChange={(e) => setExpenseForm({ ...expenseForm, person_id: e.target.value })}
                      required
                    >
                      <option value="">Select Worker</option>
                      {persons.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.name} - {person.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    >
                      <option value="wage">Wage</option>
                      <option value="bonus">Bonus</option>
                      <option value="transport">Transport</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Daily wage"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </form>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <label>Date Filter</label>
                <div className="filter-buttons">
                  {['today', 'week', 'month'].map(type => (
                    <button
                      key={type}
                      className={`filter-btn ${filterType === type ? 'active' : ''}`}
                      onClick={() => setFilterType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                  <button
                    className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
                    onClick={() => setFilterType('custom')}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {filterType === 'custom' && (
                <div className="date-range">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="filter-group">
                <label>Worker Filter</label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="person-filter"
                >
                  <option value="all">All Workers</option>
                  {persons.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Summary */}
            {expenseSummary && expenseSummary.category_summary && selectedPerson === 'all' && (
              <div className="category-summary">
                <h3>Expense by Category</h3>
                <div className="category-cards">
                  {Object.entries(expenseSummary.category_summary).map(([category, amount]) => (
                    <div key={category} className="category-card">
                      <div className="category-name">{category}</div>
                      <div className="category-amount">₹{parseFloat(amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses by Person */}
            {selectedPerson === 'all' && (
              <div className="person-summary">
                <h3>Expense by Worker</h3>
                <div className="person-cards">
                  {getExpensesByPerson().map((item, index) => (
                    <div key={index} className="person-card">
                      <div className="person-name">{item.name}</div>
                      <div className="person-role-badge">{item.role}</div>
                      <div className="person-stats">
                        <span className="stat-amount">₹{item.total.toFixed(2)}</span>
                        <span className="stat-count">{item.count} transactions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="expenses-list">
              <h3>Transactions ({filteredExpenses.length})</h3>
              
              {loading && <LoadingSpinner message="Loading expenses..." />}
              {error && <ErrorMessage message={error} onRetry={loadExpenses} />}
              
              {!loading && !error && filteredExpenses.length === 0 && (
                <div className="empty-state">
                  <p>No expenses found</p>
                  <span>Add your first expense above</span>
                </div>
              )}

              {!loading && !error && filteredExpenses.length > 0 && (
                <div className="expense-items">
                  {filteredExpenses.map((expense, index) => (
                    <div key={expense.id || index} className="expense-item">
                      <div className="expense-main">
                        <div className="expense-person-info">
                          <div className="expense-person">{expense.person}</div>
                          <div className="expense-role">{expense.role}</div>
                        </div>
                        <div className="expense-category">{expense.category}</div>
                      </div>
                      {expense.description && (
                        <div className="expense-desc">{expense.description}</div>
                      )}
                      <div className="expense-footer">
                        <span className="expense-date">
                          {expense.timestamp ? new Date(expense.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Today'}
                        </span>
                        <span className="expense-amount">₹{parseFloat(expense.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERSONS TAB */}
        {activeTab === 'persons' && (
          <div className="persons-tab">
            {/* Add Person Form */}
            <div className="form-section">
              <h3>Add Worker</h3>
              <form onSubmit={handleAddPerson} className="person-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={personForm.name}
                    onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={personForm.role}
                      onChange={(e) => setPersonForm({ ...personForm, role: e.target.value })}
                    >
                      <option value="worker">Worker</option>
                      <option value="manager">Manager</option>
                      <option value="operator">Operator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Contact</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={personForm.contact}
                      onChange={(e) => setPersonForm({ ...personForm, contact: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Worker'}
                </button>
              </form>
            </div>

            {/* Persons List */}
            <div className="persons-list">
              <h3>All Workers ({persons.length})</h3>
              
              {persons.length === 0 ? (
                <div className="empty-state">
                  <p>No workers added</p>
                  <span>Add your first worker above</span>
                </div>
              ) : (
                <div className="person-items">
                  {persons.map(person => (
                    <div key={person.id} className="person-item">
                      <div className="person-avatar">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="person-details">
                        <div className="person-name">{person.name}</div>
                        <div className="person-role">{person.role}</div>
                        {person.contact && (
                          <div className="person-contact">{person.contact}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenditure;
