import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { SHIFT_DISPLAY_NAMES } from '../utils/constants';
import '../styles/components/ReportPage.css';

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData(selectedDate);
  }, [selectedDate]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const fetchReportData = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.getShiftReport({
        date: date,
        shift: 'all',
        timezone: 'Asia/Kolkata'
      });
      
      setReportData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getShiftDisplayName = (shiftType) => {
    return SHIFT_DISPLAY_NAMES[shiftType] || shiftType;
  };

  if (loading) {
    return (
      <div className="report-page-table">
        <div className="report-header-table">
          <h2>Shift Report</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page-table">
        <div className="report-header-table">
          <h2>Shift Report</h2>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => fetchReportData(selectedDate)} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page-table">
      {/* Header */}
      <div className="report-header-table">
        <h2>Daily Shift Report</h2>
        <div className="header-right">
          <label htmlFor="report-date">Select Date:</label>
          <input
            type="date"
            id="report-date"
            value={selectedDate}
            onChange={handleDateChange}
            max={getTodayDate()}
            className="date-input-table"
          />
        </div>
      </div>

      {reportData && (
        <>
          {/* Shifts Container */}
          <div className="shifts-container">
            {reportData.shifts.map((shift, index) => (
              <div key={index}>
                <div className="shift-section-table">
                  {/* Shift Header */}
                  <div className="shift-header-bar">
                    <div className="shift-info">
                      <h3>{getShiftDisplayName(shift.shift_type)}</h3>
                      <span className="shift-time">{shift.shift_start} - {shift.shift_end}</span>
                    </div>
                    <div className="shift-stats">
                      <span className="stat-label">Total Orders:</span>
                      <span className="stat-value">{shift.order_count}</span>
                    </div>
                  </div>

                  {/* Main Report Table */}
                  <div className="report-table-wrapper">
                    <table className="report-main-table">
                      <thead>
                        <tr className="main-header-row">
                          <th className="income-header-cell">INCOME</th>
                          <th className="amount-header-cell">AMOUNT</th>
                          <th className="expense-header-cell">EXPENSES</th>
                          <th className="amount-header-cell">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ✅ NEW: Category-wise breakdown for EACH payment type */}
                        {/* Cash Payments by Category */}
                        <tr>
                          <td className="label-cell cash-category-header" colSpan="2">
                            💰 Cash Payments
                          </td>
                          <td className="label-cell expense-label">Labour Expenses</td>
                          <td className="amount-cell"></td>
                        </tr>
                        {shift.cash_category_breakdown && shift.cash_category_breakdown.length > 0 ? (
                          shift.cash_category_breakdown.map((cat, idx) => (
                            <tr key={`cash-${idx}`}>
                              <td className="label-cell category-subitem">• {cat.category_display}</td>
                              <td className="amount-cell income-value">{formatCurrency(cat.amount)}</td>
                              <td colSpan="2"></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="label-cell category-subitem">• No cash transactions</td>
                            <td className="amount-cell income-value">-</td>
                            <td colSpan="2"></td>
                          </tr>
                        )}
                        <tr>
                          <td className="label-cell"><strong>Cash Total</strong></td>
                          <td className="amount-cell income-value"><strong>{formatCurrency(shift.cash_income)}</strong></td>
                          <td colSpan="2" className="nested-table-cell">
                            {shift.worker_expenses_list.length > 0 ? (
                              <div className="nested-table-container">
                                <table className="nested-expense-table">
                                  <tbody>
                                    {shift.worker_expenses_list.map((exp, idx) => (
                                      <tr key={idx}>
                                        <td className="nested-label">
                                          <div className="nested-name">{exp.worker_name}</div>
                                          <div className="nested-desc">{exp.category} • {exp.time}</div>
                                        </td>
                                        <td className="nested-amount">{formatCurrency(exp.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="no-data-message">No labour expenses</div>
                            )}
                          </td>
                        </tr>

                        {/* UPI Payments by Category */}
                        <tr>
                          <td className="label-cell upi-category-header" colSpan="2">
                            💳 UPI Payments
                          </td>
                          <td className="label-cell subtotal-label">Labour Subtotal</td>
                          <td className="amount-cell expense-value">{formatCurrency(shift.worker_expense)}</td>
                        </tr>
                        {shift.upi_category_breakdown && shift.upi_category_breakdown.length > 0 ? (
                          shift.upi_category_breakdown.map((cat, idx) => (
                            <tr key={`upi-${idx}`}>
                              <td className="label-cell category-subitem">• {cat.category_display}</td>
                              <td className="amount-cell income-value">{formatCurrency(cat.amount)}</td>
                              <td colSpan="2"></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="label-cell category-subitem">• No UPI transactions</td>
                            <td className="amount-cell income-value">-</td>
                            <td colSpan="2"></td>
                          </tr>
                        )}
                        <tr>
                          <td className="label-cell"><strong>UPI Total</strong></td>
                          <td className="amount-cell income-value"><strong>{formatCurrency(shift.upi_income)}</strong></td>
                          <td colSpan="2"></td>
                        </tr>

                        {/* Card Payments by Category */}
                        <tr>
                          <td className="label-cell card-category-header" colSpan="2">
                            💳 Card Payments
                          </td>
                          <td className="label-cell expense-label">Material Expenses</td>
                          <td className="amount-cell"></td>
                        </tr>
                        {shift.card_category_breakdown && shift.card_category_breakdown.length > 0 ? (
                          shift.card_category_breakdown.map((cat, idx) => (
                            <tr key={`card-${idx}`}>
                              <td className="label-cell category-subitem">• {cat.category_display}</td>
                              <td className="amount-cell income-value">{formatCurrency(cat.amount)}</td>
                              <td colSpan="2"></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="label-cell category-subitem">• No card transactions</td>
                            <td className="amount-cell income-value">-</td>
                            <td colSpan="2"></td>
                          </tr>
                        )}
                        <tr>
                          <td className="label-cell"><strong>Card Total</strong></td>
                          <td className="amount-cell income-value"><strong>{formatCurrency(shift.card_income)}</strong></td>
                          <td colSpan="2" className="nested-table-cell">
                            {shift.material_expenses_list.length > 0 ? (
                              <div className="nested-table-container">
                                <table className="nested-expense-table">
                                  <tbody>
                                    {shift.material_expenses_list.map((item, idx) => (
                                      <tr key={idx}>
                                        <td className="nested-label">
                                          <div className="nested-name">{item.material_name}</div>
                                          <div className="nested-desc">
                                            {item.quantity} {item.unit} × {formatCurrency(item.unit_price)} • {item.time}
                                          </div>
                                        </td>
                                        <td className="nested-amount">{formatCurrency(item.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="no-data-message">No material expenses</div>
                            )}
                          </td>
                        </tr>

                        {/* Income Subtotal */}
                        <tr className="subtotal-row">
                          <td className="label-cell"><strong>Total Income</strong></td>
                          <td className="amount-cell income-value"><strong>{formatCurrency(shift.total_income)}</strong></td>
                          <td className="label-cell subtotal-label">Material Subtotal</td>
                          <td className="amount-cell expense-value">{formatCurrency(shift.material_expense)}</td>
                        </tr>

                        {/* Grand Total Row */}
                        <tr className="grand-total-row">
                          <td className="label-cell"><strong>TOTAL INCOME</strong></td>
                          <td className="amount-cell"><strong>{formatCurrency(shift.total_income)}</strong></td>
                          <td className="label-cell"><strong>TOTAL EXPENSES</strong></td>
                          <td className="amount-cell"><strong>{formatCurrency(shift.total_expense)}</strong></td>
                        </tr>

                        {/* Profit Row */}
                        <tr className="profit-summary-row">
                          <td colSpan="2" className="profit-info-cell">
                            <span className="profit-label">Profit Margin:</span>
                            <span className="profit-percent">{parseFloat(shift.profit_margin).toFixed(2)}%</span>
                          </td>
                          <td className="label-cell profit-label-cell"><strong>SHIFT PROFIT</strong></td>
                          <td className={`amount-cell profit-amount-cell ${parseFloat(shift.profit) >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                            <strong>{formatCurrency(shift.profit)}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shift Divider - Only show between shifts, not after last one */}
                {index < reportData.shifts.length - 1 && (
                  <div className="shift-divider">
                    <div className="divider-line"></div>
                    <div className="divider-text">• • •</div>
                    <div className="divider-line"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Section Divider */}
          <div className="summary-section-divider">
            <div className="summary-divider-line"></div>
            <div className="summary-divider-text">DAILY SUMMARY</div>
            <div className="summary-divider-line"></div>
          </div>

          {/* Daily Summary */}
          <div className="daily-summary-section">
            <h3 className="summary-title">Daily Total - {selectedDate}</h3>
            <div className="summary-grid">
              <div className="summary-box">
                <div className="summary-box-label">Total Income</div>
                <div className="summary-box-value income-highlight">{formatCurrency(reportData.daily_total_income)}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-label">Labour Expense</div>
                <div className="summary-box-value">{formatCurrency(reportData.daily_total_labour)}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-label">Material Expense</div>
                <div className="summary-box-value">{formatCurrency(reportData.daily_total_material)}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-label">Total Expense</div>
                <div className="summary-box-value expense-highlight">{formatCurrency(reportData.daily_total_expense)}</div>
              </div>
              <div className="summary-box profit-box">
                <div className="summary-box-label">Net Profit</div>
                <div className={`summary-box-value ${parseFloat(reportData.daily_profit) >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                  {formatCurrency(reportData.daily_profit)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportPage;
