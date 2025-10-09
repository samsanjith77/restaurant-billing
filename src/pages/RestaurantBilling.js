import React from 'react';
import DishList from '../components/dishes/DishList';
import OrderSummary from '../components/orders/OrderSummary';
import useDishes from '../hooks/useDishes';
import useOrder from '../hooks/useOrder';

const RestaurantBilling = () => {
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes();
  const { 
    orderItems, 
    updateQuantity, 
    calculateTotal, 
    placeOrder, 
    resetOrder,
    loading: orderLoading 
  } = useOrder();

  const total = calculateTotal(dishes);

  return (
    <div className="restaurant-billing">
      <div className="container">
        <div className="billing-layout">
          <section className="dishes-section">
            <div className="section-header">
              <h2>Our Menu</h2>
            </div>
            <DishList
              dishes={dishes}
              loading={dishesLoading}
              error={dishesError}
              orderItems={orderItems}
              onQuantityChange={updateQuantity}
              onRetry={refetch}
            />
          </section>
          
          <aside className="order-section">
            <OrderSummary
              orderItems={orderItems}
              dishes={dishes}
              total={total}
              onPlaceOrder={() => placeOrder(dishes)}
              onReset={resetOrder}
              loading={orderLoading}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBilling;