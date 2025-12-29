import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import '../styles/components/Expenditure.css';

const Expenditure = () => {
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('expenses');
  
  // Expense type filter
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('all'); // 'all', 'worker', 'material'
  
  // Filter state
  const [filterType, setFilterType] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Add worker form
  const [workerForm, setWorkerForm] = useState({
    name: '',
    role: 'worker',
    contact: ''
  });
  
  // Add material form
  const [materialForm, setMaterialForm] = useState({
    name: '',
    unit: 'piece',
    description: ''
  });
  
  // Add worker expense form
  const [workerExpenseForm, setWorkerExpenseForm] = useState({
    worker_id: '',
    category: 'wage',
    description: '',
    amount: ''
  });
  
  // Add material expense form
  const [materialExpenseForm, setMaterialExpenseForm] = useState({
    description: '',
    items: []
  });
  
  // Current material item being added
  const [currentMaterialItem, setCurrentMaterialItem] = useState({
    material_id: '',
    quantity: '',
    unit_price: ''
  });

  // Load expenses
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let payload = { 
        filter_type: filterType,
        expense_type: expenseTypeFilter
      };

      if (filterType === 'custom' && startDate && endDate) {
        payload = {
          filter_type: 'custom',
          start_date: startDate,
          end_date: endDate,
          expense_type: expenseTypeFilter
        };
      }

      console.log('📅 Fetching expenses with payload:', payload);
      
      const data = await ApiService.filterExpenses(payload);
      
      console.log('✅ Received data:', data);

      if (data && data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        setExpenseSummary(data);
      } else {
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
  }, [filterType, startDate, endDate, expenseTypeFilter]);

  // Load workers
  const loadWorkers = async () => {
    try {
      const data = await ApiService.getWorkers();
      console.log('👥 Loaded workers:', data);
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading workers:', err);
      setWorkers([]);
    }
  };

  // Load materials
  const loadMaterials = async () => {
    try {
      const data = await ApiService.getMaterials();
      console.log('📦 Loaded materials:', data);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setMaterials([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadWorkers();
    loadMaterials();
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload expenses when filters change
  useEffect(() => {
    if (workers.length > 0) {
      loadExpenses();
    }
  }, [loadExpenses, workers.length]);

  // Add worker
  const handleAddWorker = async (e) => {
    e.preventDefault();
    
    if (!workerForm.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      await ApiService.addWorker(workerForm);
      
      setMessage({ type: 'success', text: 'Worker added successfully' });
      setWorkerForm({ name: '', role: 'worker', contact: '' });
      
      await loadWorkers();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add worker' });
    } finally {
      setLoading(false);
    }
  };

  // Add material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    
    if (!materialForm.name.trim()) {
      setMessage({ type: 'error', text: 'Material name is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      await ApiService.addMaterial(materialForm);
      
      setMessage({ type: 'success', text: 'Material added successfully' });
      setMaterialForm({ name: '', unit: 'piece', description: '' });
      
      await loadMaterials();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add material' });
    } finally {
      setLoading(false);
    }
  };

  // Add worker expense
  const handleAddWorkerExpense = async (e) => {
    e.preventDefault();
    
    if (!workerExpenseForm.worker_id || !workerExpenseForm.amount) {
      setMessage({ type: 'error', text: 'Worker and amount are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        worker_id: parseInt(workerExpenseForm.worker_id),
        category: workerExpenseForm.category,
        description: workerExpenseForm.description,
        amount: parseFloat(workerExpenseForm.amount)
      };

      console.log('💰 Adding worker expense:', payload);

      await ApiService.addWorkerExpense(payload);
      
      setMessage({ type: 'success', text: 'Worker expense added successfully' });
      setWorkerExpenseForm({ worker_id: '', category: 'wage', description: '', amount: '' });
      
      await loadExpenses();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add worker expense' });
    } finally {
      setLoading(false);
    }
  };

  // Add item to material expense
  const handleAddMaterialItem = () => {
    if (!currentMaterialItem.material_id || !currentMaterialItem.quantity || !currentMaterialItem.unit_price) {
      setMessage({ type: 'error', text: 'Material, quantity and price are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const material = materials.find(m => m.id === parseInt(currentMaterialItem.material_id));
    if (!material) return;

    const newItem = {
      material_id: parseInt(currentMaterialItem.material_id),
      material_name: material.name,
      unit: material.unit_display,
      quantity: parseFloat(currentMaterialItem.quantity),
      unit_price: parseFloat(currentMaterialItem.unit_price),
      subtotal: parseFloat(currentMaterialItem.quantity) * parseFloat(currentMaterialItem.unit_price)
    };

    setMaterialExpenseForm({
      ...materialExpenseForm,
      items: [...materialExpenseForm.items, newItem]
    });

    setCurrentMaterialItem({ material_id: '', quantity: '', unit_price: '' });
  };

  // Remove item from material expense
  const handleRemoveMaterialItem = (index) => {
    const newItems = materialExpenseForm.items.filter((_, i) => i !== index);
    setMaterialExpenseForm({ ...materialExpenseForm, items: newItems });
  };

  // Submit material expense
  const handleAddMaterialExpense = async (e) => {
    e.preventDefault();
    
    if (materialExpenseForm.items.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one material item' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        description: materialExpenseForm.description || 'Material Purchase',
        items: materialExpenseForm.items.map(item => ({
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      console.log('📦 Adding material expense:', payload);

      await ApiService.addMaterialExpense(payload);
      
      setMessage({ type: 'success', text: 'Material expense added successfully' });
      setMaterialExpenseForm({ description: '', items: [] });
      
      await loadExpenses();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add material expense' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const getTotalExpense = () => {
    if (expenseSummary && expenseSummary.summary) {
      return parseFloat(expenseSummary.summary.total_amount || 0);
    }
    return 0;
  };

  const getWorkerTotal = () => {
    if (expenseSummary && expenseSummary.summary) {
      return parseFloat(expenseSummary.summary.worker_total || 0);
    }
    return 0;
  };

  const getMaterialTotal = () => {
    if (expenseSummary && expenseSummary.summary) {
      return parseFloat(expenseSummary.summary.material_total || 0);
    }
    return 0;
  };

  const getMaterialExpenseTotal = () => {
    return materialExpenseForm.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

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
        <h1>Expenditure Management</h1>
        <p>Track worker wages and material expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card summary-card--primary">
          <div className="card-icon">₹</div>
          <div className="card-info">
            <span className="card-value">₹{getTotalExpense().toFixed(2)}</span>
            <span className="card-label">Total Expense</span>
          </div>
        </div>
        <div className="summary-card summary-card--worker">
          <div className="card-icon">👷</div>
          <div className="card-info">
            <span className="card-value">₹{getWorkerTotal().toFixed(2)}</span>
            <span className="card-label">Worker Expense</span>
          </div>
        </div>
        <div className="summary-card summary-card--material">
          <div className="card-icon">📦</div>
          <div className="card-info">
            <span className="card-value">₹{getMaterialTotal().toFixed(2)}</span>
            <span className="card-label">Material Expense</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📊 Expenses
        </button>
        <button
          className={`tab ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👷 Workers
        </button>
        <button
          className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📦 Materials
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="expenses-tab">
            {/* Expense Type Toggle */}
            <div className="expense-type-toggle">
              <button
                className={`toggle-btn ${expenseTypeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setExpenseTypeFilter('all')}
              >
                All Expenses
              </button>
              <button
                className={`toggle-btn ${expenseTypeFilter === 'worker' ? 'active' : ''}`}
                onClick={() => setExpenseTypeFilter('worker')}
              >
                Worker Expenses
              </button>
              <button
                className={`toggle-btn ${expenseTypeFilter === 'material' ? 'active' : ''}`}
                onClick={() => setExpenseTypeFilter('material')}
              >
                Material Expenses
              </button>
            </div>

            {/* Add Worker Expense Form */}
            {(expenseTypeFilter === 'all' || expenseTypeFilter === 'worker') && (
              <div className="form-section">
                <h3>💰 Add Worker Expense</h3>
                <form onSubmit={handleAddWorkerExpense} className="expense-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Worker *</label>
                      <select
                        value={workerExpenseForm.worker_id}
                        onChange={(e) => setWorkerExpenseForm({ ...workerExpenseForm, worker_id: e.target.value })}
                        required
                      >
                        <option value="">Select Worker</option>
                        {workers.map(worker => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name} - {worker.role_display}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={workerExpenseForm.category}
                        onChange={(e) => setWorkerExpenseForm({ ...workerExpenseForm, category: e.target.value })}
                      >
                        <option value="wage">Daily Wage</option>
                        <option value="bonus">Bonus</option>
                        <option value="transport">Transport</option>
                        <option value="food">Food</option>
                        <option value="advance">Advance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        placeholder="e.g., Daily wage for 28th Dec"
                        value={workerExpenseForm.description}
                        onChange={(e) => setWorkerExpenseForm({ ...workerExpenseForm, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={workerExpenseForm.amount}
                        onChange={(e) => setWorkerExpenseForm({ ...workerExpenseForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : '➕ Add Worker Expense'}
                  </button>
                </form>
              </div>
            )}

            {/* Add Material Expense Form */}
            {(expenseTypeFilter === 'all' || expenseTypeFilter === 'material') && (
              <div className="form-section">
                <h3>📦 Add Material Expense</h3>
                <form onSubmit={handleAddMaterialExpense} className="expense-form">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Construction materials for project X"
                      value={materialExpenseForm.description}
                      onChange={(e) => setMaterialExpenseForm({ ...materialExpenseForm, description: e.target.value })}
                    />
                  </div>

                  {/* Add Material Items */}
                  <div className="material-items-section">
                    <h4>Material Items</h4>
                    
                    <div className="add-item-row">
                      <div className="form-group">
                        <label>Material</label>
                        <select
                          value={currentMaterialItem.material_id}
                          onChange={(e) => setCurrentMaterialItem({ ...currentMaterialItem, material_id: e.target.value })}
                        >
                          <option value="">Select Material</option>
                          {materials.map(material => (
                            <option key={material.id} value={material.id}>
                              {material.name} ({material.unit_display})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          value={currentMaterialItem.quantity}
                          onChange={(e) => setCurrentMaterialItem({ ...currentMaterialItem, quantity: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Unit Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={currentMaterialItem.unit_price}
                          onChange={(e) => setCurrentMaterialItem({ ...currentMaterialItem, unit_price: e.target.value })}
                        />
                      </div>

                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={handleAddMaterialItem}
                      >
                        ➕ Add Item
                      </button>
                    </div>

                    {/* Material Items List */}
                    {materialExpenseForm.items.length > 0 && (
                      <div className="material-items-list">
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Material</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Subtotal</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {materialExpenseForm.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.material_name}</td>
                                <td>{item.quantity} {item.unit}</td>
                                <td>₹{item.unit_price.toFixed(2)}</td>
                                <td>₹{item.subtotal.toFixed(2)}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="remove-item-btn"
                                    onClick={() => handleRemoveMaterialItem(index)}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3"><strong>Total</strong></td>
                              <td colSpan="2"><strong>₹{getMaterialExpenseTotal().toFixed(2)}</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn btn-success" 
                    disabled={loading || materialExpenseForm.items.length === 0}
                  >
                    {loading ? 'Adding...' : '➕ Add Material Expense'}
                  </button>
                </form>
              </div>
            )}

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
            </div>

            {/* Worker Summary */}
            {expenseSummary && expenseSummary.worker_summary && Object.keys(expenseSummary.worker_summary).length > 0 && (
              <div className="worker-summary-section">
                <h3>👷 Worker Expense Summary</h3>
                <div className="summary-grid">
                  {Object.entries(expenseSummary.worker_summary).map(([workerName, data]) => (
                    <div key={workerName} className="summary-item">
                      <div className="summary-header">
                        <span className="worker-name">{workerName}</span>
                        <span className="worker-role-badge">{data.role}</span>
                      </div>
                      <div className="summary-stats">
                        <div className="stat">
                          <span className="stat-label">Total</span>
                          <span className="stat-value">₹{data.total.toFixed(2)}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Transactions</span>
                          <span className="stat-value">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material Summary */}
            {expenseSummary && expenseSummary.material_summary && Object.keys(expenseSummary.material_summary).length > 0 && (
              <div className="material-summary-section">
                <h3>📦 Material Expense Summary</h3>
                <div className="summary-grid">
                  {Object.entries(expenseSummary.material_summary).map(([materialName, data]) => (
                    <div key={materialName} className="summary-item">
                      <div className="summary-header">
                        <span className="material-name">{materialName}</span>
                        <span className="material-unit-badge">{data.unit}</span>
                      </div>
                      <div className="summary-stats">
                        <div className="stat">
                          <span className="stat-label">Quantity</span>
                          <span className="stat-value">{data.total_quantity.toFixed(2)}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Amount</span>
                          <span className="stat-value">₹{data.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Purchases</span>
                          <span className="stat-value">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="expenses-list">
              <h3>Transactions ({expenses.length})</h3>
              
              {loading && <LoadingSpinner message="Loading expenses..." />}
              {error && <ErrorMessage message={error} onRetry={loadExpenses} />}
              
              {!loading && !error && expenses.length === 0 && (
                <div className="empty-state">
                  <p>No expenses found</p>
                  <span>Add your first expense above</span>
                </div>
              )}

              {!loading && !error && expenses.length > 0 && (
                <div className="expense-items">
                  {expenses.map((expense, index) => (
                    <div 
                      key={expense.id || index} 
                      className={`expense-item expense-item--${expense.expense_type}`}
                    >
                      <div className="expense-type-badge">
                        {expense.expense_type === 'worker' ? '👷' : '📦'} {expense.expense_type_display}
                      </div>
                      
                      {expense.expense_type === 'worker' ? (
                        // Worker Expense
                        <>
                          <div className="expense-main">
                            <div className="expense-person-info">
                              <div className="expense-person">{expense.worker}</div>
                              <div className="expense-role">{expense.worker_role}</div>
                            </div>
                            <div className="expense-category">{expense.category_display}</div>
                          </div>
                          {expense.description && (
                            <div className="expense-desc">{expense.description}</div>
                          )}
                          <div className="expense-footer">
                            <span className="expense-date">
                              {new Date(expense.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="expense-amount">₹{parseFloat(expense.total_amount).toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        // Material Expense
                        <>
                          <div className="expense-main">
                            <div className="expense-description">{expense.description}</div>
                          </div>
                          {expense.items && expense.items.length > 0 && (
                            <div className="expense-materials">
                              {expense.items.map((item, idx) => (
                                <div key={idx} className="material-item">
                                  <span className="material-name">{item.material}</span>
                                  <span className="material-quantity">{item.quantity} {item.unit}</span>
                                  <span className="material-price">@ ₹{item.unit_price}</span>
                                  <span className="material-subtotal">₹{item.subtotal}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="expense-footer">
                            <span className="expense-date">
                              {new Date(expense.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="expense-amount expense-amount--total">
                              Total: ₹{parseFloat(expense.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === 'workers' && (
          <div className="workers-tab">
            {/* Add Worker Form */}
            <div className="form-section">
              <h3>➕ Add Worker</h3>
              <form onSubmit={handleAddWorker} className="worker-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Enter worker name"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={workerForm.role}
                      onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                    >
                      <option value="worker">Worker / Operator</option>
                      <option value="manager">Manager</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Contact</label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={workerForm.contact}
                      onChange={(e) => setWorkerForm({ ...workerForm, contact: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : '➕ Add Worker'}
                </button>
              </form>
            </div>

            {/* Workers List */}
            <div className="workers-list">
              <h3>All Workers ({workers.length})</h3>
              
              {workers.length === 0 ? (
                <div className="empty-state">
                  <p>No workers added</p>
                  <span>Add your first worker above</span>
                </div>
              ) : (
                <div className="worker-items">
                  {workers.map(worker => {
                    // Calculate worker's total expense
                    const workerExpenseData = expenseSummary?.worker_summary?.[worker.name];
                    
                    return (
                      <div key={worker.id} className="worker-item">
                        <div className="worker-avatar">
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="worker-details">
                          <div className="worker-name">{worker.name}</div>
                          <div className="worker-role">{worker.role_display}</div>
                          {worker.contact && (
                            <div className="worker-contact">📞 {worker.contact}</div>
                          )}
                          {workerExpenseData && (
                            <div className="worker-expense-summary">
                              <span className="expense-total">Total Expense: ₹{workerExpenseData.total.toFixed(2)}</span>
                              <span className="expense-count">({workerExpenseData.count} transactions)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="materials-tab">
            {/* Add Material Form */}
            <div className="form-section">
              <h3>➕ Add Material</h3>
              <form onSubmit={handleAddMaterial} className="material-form">
                <div className="form-group">
                  <label>Material Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Cement, Steel Rod, Bricks"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit *</label>
                    <select
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="bag">Bag</option>
                      <option value="ton">Ton</option>
                      <option value="piece">Piece</option>
                      <option value="meter">Meter</option>
                      <option value="liter">Liter</option>
                      <option value="box">Box</option>
                      <option value="bundle">Bundle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Optional description"
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn btn-success" disabled={loading}>
                  {loading ? 'Adding...' : '➕ Add Material'}
                </button>
              </form>
            </div>

            {/* Materials List */}
            <div className="materials-list">
              <h3>All Materials ({materials.length})</h3>
              
              {materials.length === 0 ? (
                <div className="empty-state">
                  <p>No materials added</p>
                  <span>Add your first material above</span>
                </div>
              ) : (
                <div className="material-items-grid">
                  {materials.map(material => {
                    // Calculate material's total usage
                    const materialUsageData = expenseSummary?.material_summary?.[material.name];
                    
                    return (
                      <div key={material.id} className="material-item-card">
                        <div className="material-icon">📦</div>
                        <div className="material-info">
                          <div className="material-name">{material.name}</div>
                          <div className="material-unit">{material.unit_display}</div>
                          {material.description && (
                            <div className="material-description">{material.description}</div>
                          )}
                          {materialUsageData && (
                            <div className="material-usage-summary">
                              <div className="usage-stat">
                                <span className="usage-label">Total Quantity:</span>
                                <span className="usage-value">{materialUsageData.total_quantity.toFixed(2)}</span>
                              </div>
                              <div className="usage-stat">
                                <span className="usage-label">Total Cost:</span>
                                <span className="usage-value">₹{materialUsageData.total_amount.toFixed(2)}</span>
                              </div>
                              <div className="usage-stat">
                                <span className="usage-label">Purchases:</span>
                                <span className="usage-value">{materialUsageData.count}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
