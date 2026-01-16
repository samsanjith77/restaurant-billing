import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { SHIFT_DISPLAY_NAMES } from '../utils/constants';
import '../styles/components/ReportPage.css';

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [reportData, setReportData] = useState(null);
  const [dishesData, setDishesData] = useState([]);

  useEffect(() => {
    fetchReportData(selectedDate);
    fetchDishSales(selectedDate);
  }, [selectedDate]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const fetchReportData = async (date) => {
    try {
      const data = await ApiService.getShiftReport({
        date: date,
        shift: 'all',
        timezone: 'Asia/Kolkata'
      });

      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  const fetchDishSales = async (date) => {
    try {
      const data = await ApiService.getDishSalesByShift({
        date: date,
        group_by_shift: true
      });

      const dishMap = {};

      if (data.shifts) {
        data.shifts.forEach(shift => {
          shift.dishes?.forEach(dish => {
            if (dishMap[dish.dish_id]) {
              dishMap[dish.dish_id].total_quantity_sold += dish.total_quantity_sold;
              dishMap[dish.dish_id].total_amount += dish.total_amount;
            } else {
              dishMap[dish.dish_id] = { ...dish };
            }
          });
        });
      }

      setDishesData(
        Object.values(dishMap).sort(
          (a, b) => b.total_quantity_sold - a.total_quantity_sold
        )
      );
    } catch (err) {
      console.error("Error fetching dish sales:", err);
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
    return SHIFT_DISPLAY_NAMES[shiftType]?.toUpperCase() || shiftType.toUpperCase();
  };

  return (
    <div className="report-page-table">
      <div className="report-header-table">
        <h2>DAILY SHIFT REPORT</h2>
        <div className="header-right">
          <label>SELECT DATE:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={getTodayDate()}
            className="date-input-table"
          />
        </div>
      </div>

      {reportData && reportData.shifts.map((shift, index) => (
        <div key={index} className="shift-section-table">
          <div className="shift-header-bar">
            <h3>{getShiftDisplayName(shift.shift_type)}</h3>
          </div>

          <table className="report-main-table">
            <thead>
              <tr>
                <th>INCOME CATEGORY</th>
                <th>AMOUNT</th>
                <th>EXPENSE TYPE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>

            <tbody>

              {/* CATEGORY WISE INCOME */}
              {shift.cash_category_breakdown?.map((cat, i) => (
                <tr key={`cash-${i}`}>
                  <td>{cat.category_display.toUpperCase()}</td>
                  <td>{formatCurrency(cat.amount)}</td>
                  <td></td>
                  <td></td>
                </tr>
              ))}

              <tr>
                <td><strong>CASH TOTAL</strong></td>
                <td>{formatCurrency(shift.cash_income)}</td>
                <td><strong>LABOUR EXPENSES</strong></td>
                <td></td>
              </tr>

              {/* LABOUR EXPENSE LIST */}
              {shift.worker_expenses_list?.map((exp, i) => (
                <tr key={`lab-${i}`}>
                  <td></td>
                  <td></td>
                  <td style={{ paddingLeft: "20px" }}>
                    {exp.worker_name.toUpperCase()} - {exp.category.toUpperCase()}
                  </td>
                  <td>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}

              <tr>
                <td><strong>UPI TOTAL</strong></td>
                <td>{formatCurrency(shift.upi_income)}</td>
                <td><strong>LABOUR SUBTOTAL</strong></td>
                <td>{formatCurrency(shift.worker_expense)}</td>
              </tr>

              {/* MATERIAL EXPENSE LIST */}
              <tr>
                <td><strong>CARD TOTAL</strong></td>
                <td>{formatCurrency(shift.card_income)}</td>
                <td><strong>MATERIAL EXPENSES</strong></td>
                <td></td>
              </tr>

              {shift.material_expenses_list?.map((item, i) => (
                <tr key={`mat-${i}`}>
                  <td></td>
                  <td></td>
                  <td style={{ paddingLeft: "20px" }}>
                    {item.material_name.toUpperCase()}
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))}

              <tr>
                <td><strong>TOTAL INCOME</strong></td>
                <td>{formatCurrency(shift.total_income)}</td>
                <td><strong>MATERIAL SUBTOTAL</strong></td>
                <td>{formatCurrency(shift.material_expense)}</td>
              </tr>

              <tr>
                <td><strong>GRAND INCOME</strong></td>
                <td>{formatCurrency(shift.total_income)}</td>
                <td><strong>TOTAL EXPENSE</strong></td>
                <td>{formatCurrency(shift.total_expense)}</td>
              </tr>

              <tr>
                <td colSpan="2">
                  PROFIT MARGIN: {parseFloat(shift.profit_margin).toFixed(2)}%
                </td>
                <td><strong>SHIFT PROFIT</strong></td>
                <td>{formatCurrency(shift.profit)}</td>
              </tr>

            </tbody>
          </table>
        </div>
      ))}

      {/* DISH SALES SECTION */}
      <div className="dish-sales-section">
        <h3>ALL DISH SALES - {selectedDate}</h3>

        {dishesData.length > 0 && (
          <table className="dishes-table">
            <thead>
              <tr>
                <th>DISH NAME</th>
                <th>QUANTITY</th>
                <th>TOTAL AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {dishesData.map((dish, i) => (
                <tr key={i}>
                  <td>{dish.dish_name.toUpperCase()}</td>
                  <td>{dish.total_quantity_sold}</td>
                  <td>{formatCurrency(dish.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ReportPage;
