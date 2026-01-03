import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

import '../styles/components/Expenditure.css';


const Expenditure = () => {
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [activeView, setActiveView] = useState('addExpense');
  const [expenseType, setExpenseType] = useState('worker');
  const [filterType, setFilterType] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [workerExpenseForm, setWorkerExpenseForm] = useState({
    worker_id: '',
    category: 'wage',
    description: '',
    amount: ''
  });

  const [materialItems, setMaterialItems] = useState([{
    material_id: '',
    quantity: '',
    unit_price: ''
  }]);
  const [materialDescription, setMaterialDescription] = useState('');

  const [newWorker, setNewWorker] = useState({
    name: '',
    role: 'worker',
    contact: ''
  });

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    unit: 'kg',
    description: ''
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const parseNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  const loadWorkers = async () => {
    try {
      const data = await ApiService.getWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading workers:', err);
      setWorkers([]);
    }
  };

  const loadMaterials = async () => {
    try {
      const data = await ApiService.getMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setMaterials([]);
    }
  };

  const loadExpenses = useCallback(async () => {
    setLoading(true);
   

    try {
      let payload = { 
        filter_type: filterType,
        expense_type: 'all'
      };

      if (filterType === 'custom' && startDate && endDate) {
        payload = {
          filter_type: 'custom',
          start_date: startDate,
          end_date: endDate,
          expense_type: 'all'
        };
      }

      const data = await ApiService.filterExpenses(payload);

      if (data && data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        setExpenseSummary(data);
      } else {
        setExpenses([]);
        setExpenseSummary(null);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setExpenses([]);
      setExpenseSummary(null);
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    loadWorkers();
    loadMaterials();
    loadExpenses();
  }, [loadExpenses]);

  const handleAddWorkerExpense = async (e) => {
    e.preventDefault();

    if (!workerExpenseForm.worker_id || !workerExpenseForm.amount) {
      showMessage('error', 'Please select a worker and enter amount');
      return;
    }

    const amount = parseNumber(workerExpenseForm.amount);
    if (amount <= 0) {
      showMessage('error', 'Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        worker_id: parseInt(workerExpenseForm.worker_id),
        category: workerExpenseForm.category,
        description: workerExpenseForm.description || '',
        amount: amount
      };

      await ApiService.addWorkerExpense(payload);

      showMessage('success', 'Worker expense added successfully');
      setWorkerExpenseForm({ worker_id: '', category: 'wage', description: '', amount: '' });

      await loadExpenses();
    } catch (err) {
      showMessage('error', err.message || 'Failed to add worker expense');
    } finally {
      setLoading(false);
    }
  };

  const addMaterialRow = () => {
    setMaterialItems([...materialItems, { material_id: '', quantity: '', unit_price: '' }]);
  };

  const removeMaterialRow = (index) => {
    if (materialItems.length === 1) {
      showMessage('error', 'At least one material is required');
      return;
    }
    const newItems = materialItems.filter((_, i) => i !== index);
    setMaterialItems(newItems);
  };

  const updateMaterialItem = (index, field, value) => {
    const newItems = [...materialItems];
    newItems[index][field] = value;
    setMaterialItems(newItems);
  };

  const calculateMaterialTotal = () => {
    return materialItems.reduce((sum, item) => {
      const qty = parseNumber(item.quantity);
      const price = parseNumber(item.unit_price);
      return sum + (qty * price);
    }, 0);
  };

  const handleAddMaterialExpense = async (e) => {
    e.preventDefault();

    const validItems = materialItems.filter(item => 
      item.material_id && item.quantity && item.unit_price
    );

    if (validItems.length === 0) {
      showMessage('error', 'Please add at least one material with quantity and price');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        description: materialDescription || 'Material Purchase',
        items: validItems.map(item => ({
          material_id: parseInt(item.material_id),
          quantity: parseNumber(item.quantity),
          unit_price: parseNumber(item.unit_price)
        }))
      };

      await ApiService.addMaterialExpense(payload);

      showMessage('success', 'Material expense added successfully');
      setMaterialItems([{ material_id: '', quantity: '', unit_price: '' }]);
      setMaterialDescription('');

      await loadExpenses();
    } catch (err) {
      showMessage('error', err.message || 'Failed to add material expense');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();

    if (!newWorker.name.trim()) {
      showMessage('error', 'Worker name is required');
      return;
    }

    setLoading(true);

    try {
      await ApiService.addWorker(newWorker);

      showMessage('success', 'Worker added successfully');
      setNewWorker({ name: '', role: 'worker', contact: '' });

      await loadWorkers();
    } catch (err) {
      showMessage('error', err.message || 'Failed to add worker');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    if (!newMaterial.name.trim()) {
      showMessage('error', 'Material name is required');
      return;
    }

    setLoading(true);

    try {
      await ApiService.addMaterial(newMaterial);

      showMessage('success', 'Material added successfully');
      setNewMaterial({ name: '', unit: 'kg', description: '' });

      await loadMaterials();
    } catch (err) {
      showMessage('error', err.message || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  // DELETE HANDLERS
  const handleDeleteWorker = async (workerId, workerName) => {
    if (!window.confirm(`Are you sure you want to delete ${workerName}?`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await ApiService.deleteWorker(workerId);
      showMessage('success', result.message || 'Worker deleted successfully');
      await loadWorkers();
    } catch (err) {
      showMessage('error', err.message || 'Failed to delete worker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId, materialName) => {
    if (!window.confirm(`Are you sure you want to delete ${materialName}?`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await ApiService.deleteMaterial(materialId);
      showMessage('success', result.message || 'Material deleted successfully');
      await loadMaterials();
    } catch (err) {
      showMessage('error', err.message || 'Failed to delete material');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId, expenseDesc) => {
    if (!window.confirm(`Are you sure you want to delete this expense: "${expenseDesc}"?`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await ApiService.deleteExpense(expenseId);
      showMessage('success', result.message || 'Expense deleted successfully');
      await loadExpenses();
    } catch (err) {
      showMessage('error', err.message || 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const getTotalExpense = () => {
    return parseNumber(expenseSummary?.summary?.total_amount, 0);
  };

  const getWorkerTotal = () => {
    return parseNumber(expenseSummary?.summary?.worker_total, 0);
  };

  const getMaterialTotal = () => {
    return parseNumber(expenseSummary?.summary?.material_total, 0);
  };

  const formatCurrency = (amount) => {
    const num = parseNumber(amount);
    return num.toFixed(2);
  };

  return React.createElement(
    'div',
    { className: 'expenditure-container' },

    message && React.createElement(
      'div',
      { className: `message-toast message-${message.type}` },
      React.createElement(
        'div',
        { className: 'message-content' },
        message.type === 'success' && React.createElement(
          'svg',
          { className: 'message-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M5 13l4 4L19 7' })
        ),
        message.type === 'error' && React.createElement(
          'svg',
          { className: 'message-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
        ),
        React.createElement('span', null, message.text)
      )
    ),

    React.createElement(
      'div',
      { className: 'summary-section' },
      React.createElement(
        'div',
        { className: 'summary-card total' },
        React.createElement(
          'div',
          { className: 'card-icon' },
          React.createElement(
            'svg',
            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
          )
        ),
        React.createElement(
          'div',
          { className: 'card-content' },
          React.createElement('span', { className: 'card-label' }, 'Total Expense'),
          React.createElement('span', { className: 'card-value' }, '₹' + formatCurrency(getTotalExpense()))
        )
      ),
      React.createElement(
        'div',
        { className: 'summary-card worker' },
        React.createElement(
          'div',
          { className: 'card-icon' },
          React.createElement(
            'svg',
            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
          )
        ),
        React.createElement(
          'div',
          { className: 'card-content' },
          React.createElement('span', { className: 'card-label' }, 'Worker Expense'),
          React.createElement('span', { className: 'card-value' }, '₹' + formatCurrency(getWorkerTotal()))
        )
      ),
      React.createElement(
        'div',
        { className: 'summary-card material' },
        React.createElement(
          'div',
          { className: 'card-icon' },
          React.createElement(
            'svg',
            { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
          )
        ),
        React.createElement(
          'div',
          { className: 'card-content' },
          React.createElement('span', { className: 'card-label' }, 'Material Expense'),
          React.createElement('span', { className: 'card-value' }, '₹' + formatCurrency(getMaterialTotal()))
        )
      )
    ),

    React.createElement(
      'div',
      { className: 'nav-tabs' },
      React.createElement(
        'button',
        {
          className: `nav-tab ${activeView === 'addExpense' ? 'active' : ''}`,
          onClick: () => setActiveView('addExpense')
        },
        React.createElement(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4v16m8-8H4' })
        ),
        'Add Expense'
      ),
      React.createElement(
        'button',
        {
          className: `nav-tab ${activeView === 'viewExpenses' ? 'active' : ''}`,
          onClick: () => setActiveView('viewExpenses')
        },
        React.createElement(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
        ),
        'View Expenses'
      ),
      React.createElement(
        'button',
        {
          className: `nav-tab ${activeView === 'manageWorkers' ? 'active' : ''}`,
          onClick: () => setActiveView('manageWorkers')
        },
        React.createElement(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
        ),
        'Workers'
      ),
      React.createElement(
        'button',
        {
          className: `nav-tab ${activeView === 'manageMaterials' ? 'active' : ''}`,
          onClick: () => setActiveView('manageMaterials')
        },
        React.createElement(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
        ),
        'Materials'
      )
    ),

    React.createElement(
      'div',
      { className: 'content-wrapper' },

      // ADD EXPENSE VIEW
      activeView === 'addExpense' && React.createElement(
        'div',
        { className: 'add-expense-content' },
        React.createElement(
          'div',
          { className: 'expense-type-selector' },
          React.createElement(
            'button',
            {
              className: `type-btn ${expenseType === 'worker' ? 'active' : ''}`,
              onClick: () => setExpenseType('worker')
            },
            React.createElement(
              'svg',
              { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
            ),
            React.createElement('span', null, 'Worker Payment')
          ),
          React.createElement(
            'button',
            {
              className: `type-btn ${expenseType === 'material' ? 'active' : ''}`,
              onClick: () => setExpenseType('material')
            },
            React.createElement(
              'svg',
              { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
            ),
            React.createElement('span', null, 'Material Purchase')
          )
        ),

        React.createElement(
          'div',
          { className: 'form-container' },
          expenseType === 'worker' && React.createElement(
            'form',
            { onSubmit: handleAddWorkerExpense, className: 'expense-form' },
            React.createElement(
              'div',
              { className: 'form-grid' },
              React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement('label', null, 'Select Worker'),
                React.createElement(
                  'select',
                  {
                    value: workerExpenseForm.worker_id,
                    onChange: (e) => setWorkerExpenseForm({ ...workerExpenseForm, worker_id: e.target.value }),
                    required: true
                  },
                  React.createElement('option', { value: '' }, 'Choose a worker'),
                  workers.map(worker => React.createElement(
                    'option',
                    { key: worker.id, value: worker.id },
                    `${worker.name} - ${worker.role_display}`
                  ))
                )
              ),
              React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement('label', null, 'Payment Type'),
                React.createElement(
                  'select',
                  {
                    value: workerExpenseForm.category,
                    onChange: (e) => setWorkerExpenseForm({ ...workerExpenseForm, category: e.target.value })
                  },
                  React.createElement('option', { value: 'wage' }, 'Daily Wage'),
                  React.createElement('option', { value: 'bonus' }, 'Bonus'),
                  React.createElement('option', { value: 'advance' }, 'Advance Payment'),
                  React.createElement('option', { value: 'transport' }, 'Transport'),
                  React.createElement('option', { value: 'food' }, 'Food Allowance'),
                  React.createElement('option', { value: 'other' }, 'Other')
                )
              ),
              React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement('label', null, 'Amount (₹)'),
                React.createElement('input', {
                  type: 'number',
                  step: '0.01',
                  min: '0',
                  placeholder: 'Enter amount',
                  value: workerExpenseForm.amount,
                  onChange: (e) => setWorkerExpenseForm({ ...workerExpenseForm, amount: e.target.value }),
                  required: true
                })
              ),
              React.createElement(
                'div',
                { className: 'form-group full-width' },
                React.createElement('label', null, 'Notes (Optional)'),
                React.createElement('textarea', {
                  placeholder: 'Add any notes about this payment',
                  rows: 2,
                  value: workerExpenseForm.description,
                  onChange: (e) => setWorkerExpenseForm({ ...workerExpenseForm, description: e.target.value })
                })
              )
            ),
            React.createElement(
              'button',
              { type: 'submit', className: 'submit-btn', disabled: loading },
              loading ? 'Adding...' : 'Add Payment'
            )
          ),

          expenseType === 'material' && React.createElement(
            'form',
            { onSubmit: handleAddMaterialExpense, className: 'expense-form' },
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Purchase Description (Optional)'),
              React.createElement('input', {
                type: 'text',
                placeholder: 'e.g., Monthly material purchase',
                value: materialDescription,
                onChange: (e) => setMaterialDescription(e.target.value)
              })
            ),
            React.createElement(
              'div',
              { className: 'material-section' },
              React.createElement(
                'div',
                { className: 'section-header' },
                React.createElement('h3', null, 'Materials'),
                React.createElement(
                  'button',
                  { type: 'button', className: 'add-btn', onClick: addMaterialRow },
                  React.createElement(
                    'svg',
                    { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
                    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4v16m8-8H4' })
                  ),
                  'Add More'
                )
              ),
              React.createElement(
                'div',
                { className: 'material-items' },
                materialItems.map((item, index) => React.createElement(
                  'div',
                  { key: index, className: 'material-row' },
                  React.createElement('span', { className: 'row-num' }, index + 1),
                  React.createElement(
                    'div',
                    { className: 'material-fields' },
                    React.createElement(
                      'select',
                      {
                        value: item.material_id,
                        onChange: (e) => updateMaterialItem(index, 'material_id', e.target.value),
                        required: true
                      },
                      React.createElement('option', { value: '' }, 'Select material'),
                      materials.map(material => React.createElement(
                        'option',
                        { key: material.id, value: material.id },
                        `${material.name} (${material.unit_display})`
                      ))
                    ),
                    React.createElement('input', {
                      type: 'number',
                      step: '0.01',
                      min: '0',
                      placeholder: 'Qty',
                      value: item.quantity,
                      onChange: (e) => updateMaterialItem(index, 'quantity', e.target.value),
                      required: true
                    }),
                    React.createElement('input', {
                      type: 'number',
                      step: '0.01',
                      min: '0',
                      placeholder: 'Price',
                      value: item.unit_price,
                      onChange: (e) => updateMaterialItem(index, 'unit_price', e.target.value),
                      required: true
                    }),
                    React.createElement(
                      'div',
                      { className: 'subtotal' },
                      '₹' + formatCurrency(parseNumber(item.quantity) * parseNumber(item.unit_price))
                    )
                  ),
                  materialItems.length > 1 && React.createElement(
                    'button',
                    {
                      type: 'button',
                      className: 'remove-btn',
                      onClick: () => removeMaterialRow(index)
                    },
                    React.createElement(
                      'svg',
                      { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
                    )
                  )
                ))
              ),
              React.createElement(
                'div',
                { className: 'total-row' },
                React.createElement('span', null, 'Total Amount:'),
                React.createElement('span', { className: 'total-amount' }, '₹' + formatCurrency(calculateMaterialTotal()))
              )
            ),
            React.createElement(
              'button',
              { type: 'submit', className: 'submit-btn', disabled: loading || calculateMaterialTotal() === 0 },
              loading ? 'Adding...' : 'Add Purchase'
            )
          )
        )
      ),

      // VIEW EXPENSES VIEW
      activeView === 'viewExpenses' && React.createElement(
        'div',
        { className: 'view-expenses-section' },
        React.createElement(
          'div',
          { className: 'filter-section' },
          React.createElement(
            'div',
            { className: 'filter-controls' },
            React.createElement(
              'select',
              {
                value: filterType,
                onChange: (e) => setFilterType(e.target.value),
                className: 'filter-select'
              },
              React.createElement('option', { value: 'today' }, 'Today'),
              React.createElement('option', { value: 'week' }, 'This Week'),
              React.createElement('option', { value: 'month' }, 'This Month'),
              React.createElement('option', { value: 'custom' }, 'Custom Range')
            ),
            filterType === 'custom' && React.createElement(
              React.Fragment,
              null,
              React.createElement('input', {
                type: 'date',
                value: startDate,
                onChange: (e) => setStartDate(e.target.value),
                className: 'date-input'
              }),
              React.createElement('input', {
                type: 'date',
                value: endDate,
                onChange: (e) => setEndDate(e.target.value),
                className: 'date-input'
              }),
              React.createElement(
                'button',
                {
                  onClick: loadExpenses,
                  className: 'filter-btn',
                  disabled: loading
                },
                'Apply'
              )
            )
          )
        ),

        loading ? React.createElement(LoadingSpinner) : React.createElement(
          'div',
          { className: 'expenses-list' },
          expenses.length === 0 ? React.createElement(
            'p',
            { className: 'no-data' },
            'No expenses found for the selected period'
          ) : expenses.map(expense => React.createElement(
            'div',
            { key: expense.id, className: `expense-card ${expense.expense_type}` },
            React.createElement(
              'div',
              { className: 'expense-header' },
              React.createElement(
                'div',
                { className: 'expense-type-badge' },
                expense.expense_type_display
              ),
              React.createElement('span', { className: 'expense-date' }, 
                new Date(expense.timestamp).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              )
            ),
            React.createElement(
              'div',
              { className: 'expense-body' },
              expense.expense_type === 'worker' ? React.createElement(
                React.Fragment,
                null,
                React.createElement('h4', null, expense.worker),
                React.createElement('p', null, 'Category: ' + expense.category_display),
                expense.description && React.createElement('p', { className: 'expense-desc' }, expense.description)
              ) : React.createElement(
                React.Fragment,
                null,
                React.createElement('h4', null, expense.description),
                React.createElement(
                  'div',
                  { className: 'material-items-list' },
                  expense.items && expense.items.map((item, idx) => React.createElement(
                    'div',
                    { key: idx, className: 'material-item' },
                    React.createElement('span', null, item.material),
                    React.createElement('span', null, `${item.quantity} ${item.unit}`),
                    React.createElement('span', null, `@ ₹${item.unit_price}`),
                    React.createElement('span', { className: 'item-subtotal' }, `₹${item.subtotal}`)
                  ))
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'expense-footer' },
              React.createElement('span', { className: 'expense-amount' }, '₹' + formatCurrency(expense.total_amount)),
              React.createElement(
                'button',
                {
                  className: 'delete-btn-small',
                  onClick: () => handleDeleteExpense(expense.id, expense.description || expense.worker),
                  disabled: loading
                },
                React.createElement(
                  'svg',
                  { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
                ),
                'Delete'
              )
            )
          ))
        )
      ),

      // MANAGE WORKERS VIEW
      activeView === 'manageWorkers' && React.createElement(
        'div',
        { className: 'manage-section' },
        React.createElement('h2', null, 'Manage Workers'),

        React.createElement(
          'form',
          { onSubmit: handleAddWorker, className: 'add-form' },
          React.createElement('h3', null, 'Add New Worker'),
          React.createElement(
            'div',
            { className: 'form-grid' },
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Name *'),
              React.createElement('input', {
                type: 'text',
                placeholder: 'Worker name',
                value: newWorker.name,
                onChange: (e) => setNewWorker({ ...newWorker, name: e.target.value }),
                required: true
              })
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Role'),
              React.createElement(
                'select',
                {
                  value: newWorker.role,
                  onChange: (e) => setNewWorker({ ...newWorker, role: e.target.value })
                },
                React.createElement('option', { value: 'worker' }, 'Worker / Operator'),
                React.createElement('option', { value: 'supervisor' }, 'Supervisor'),
                React.createElement('option', { value: 'manager' }, 'Manager')
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Contact'),
              React.createElement('input', {
                type: 'text',
                placeholder: 'Phone number',
                value: newWorker.contact,
                onChange: (e) => setNewWorker({ ...newWorker, contact: e.target.value })
              })
            )
          ),
          React.createElement(
            'button',
            { type: 'submit', className: 'submit-btn', disabled: loading },
            loading ? 'Adding...' : 'Add Worker'
          )
        ),

        React.createElement(
          'div',
          { className: 'items-list' },
          React.createElement('h3', null, `Workers (${workers.length})`),
          workers.length === 0 ? React.createElement(
            'p',
            { className: 'no-data' },
            'No workers found'
          ) : React.createElement(
            'div',
            { className: 'list-grid' },
            workers.map(worker => React.createElement(
              'div',
              { key: worker.id, className: 'list-item' },
              React.createElement(
                'div',
                { className: 'item-info' },
                React.createElement('h4', null, worker.name),
                React.createElement('span', { className: 'item-meta' }, worker.role_display),
                worker.contact && React.createElement('span', { className: 'item-meta' }, '📞 ' + worker.contact)
              ),
              React.createElement(
                'button',
                {
                  className: 'delete-btn',
                  onClick: () => handleDeleteWorker(worker.id, worker.name),
                  disabled: loading
                },
                React.createElement(
                  'svg',
                  { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
                )
              )
            ))
          )
        )
      ),

      // MANAGE MATERIALS VIEW
      activeView === 'manageMaterials' && React.createElement(
        'div',
        { className: 'manage-section' },
        React.createElement('h2', null, 'Manage Materials'),

        React.createElement(
          'form',
          { onSubmit: handleAddMaterial, className: 'add-form' },
          React.createElement('h3', null, 'Add New Material'),
          React.createElement(
            'div',
            { className: 'form-grid' },
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Name *'),
              React.createElement('input', {
                type: 'text',
                placeholder: 'Material name',
                value: newMaterial.name,
                onChange: (e) => setNewMaterial({ ...newMaterial, name: e.target.value }),
                required: true
              })
            ),
            React.createElement(
              'div',
              { className: 'form-group' },
              React.createElement('label', null, 'Unit'),
              React.createElement(
                'select',
                {
                  value: newMaterial.unit,
                  onChange: (e) => setNewMaterial({ ...newMaterial, unit: e.target.value })
                },
                React.createElement('option', { value: 'kg' }, 'Kilogram'),
                React.createElement('option', { value: 'bag' }, 'Bag'),
                React.createElement('option', { value: 'ton' }, 'Ton'),
                React.createElement('option', { value: 'piece' }, 'Piece'),
                React.createElement('option', { value: 'meter' }, 'Meter'),
                React.createElement('option', { value: 'liter' }, 'Liter'),
                React.createElement('option', { value: 'box' }, 'Box'),
                React.createElement('option', { value: 'bundle' }, 'Bundle'),
                React.createElement('option', { value: 'other' }, 'Other')
              )
            ),
            React.createElement(
              'div',
              { className: 'form-group full-width' },
              React.createElement('label', null, 'Description'),
              React.createElement('textarea', {
                placeholder: 'Material description',
                rows: 2,
                value: newMaterial.description,
                onChange: (e) => setNewMaterial({ ...newMaterial, description: e.target.value })
              })
            )
          ),
          React.createElement(
            'button',
            { type: 'submit', className: 'submit-btn', disabled: loading },
            loading ? 'Adding...' : 'Add Material'
          )
        ),

        React.createElement(
          'div',
          { className: 'items-list' },
          React.createElement('h3', null, `Materials (${materials.length})`),
          materials.length === 0 ? React.createElement(
            'p',
            { className: 'no-data' },
            'No materials found'
          ) : React.createElement(
            'div',
            { className: 'list-grid' },
            materials.map(material => React.createElement(
              'div',
              { key: material.id, className: 'list-item' },
              React.createElement(
                'div',
                { className: 'item-info' },
                React.createElement('h4', null, material.name),
                React.createElement('span', { className: 'item-meta' }, 'Unit: ' + material.unit_display),
                material.description && React.createElement('span', { className: 'item-desc' }, material.description)
              ),
              React.createElement(
                'button',
                {
                  className: 'delete-btn',
                  onClick: () => handleDeleteMaterial(material.id, material.name),
                  disabled: loading
                },
                React.createElement(
                  'svg',
                  { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
                )
              )
            ))
          )
        )
      )
    )
  );
};


export default Expenditure;