import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import RestaurantBilling from '../pages/RestaurantBilling';
import DishManagement from '../pages/DishManagement';
import Expenditure from '../pages/Expenditure';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/billing" replace />} />
        <Route path="billing" element={<RestaurantBilling />} />
        <Route path="dishes" element={<DishManagement />} />
        {/* Future routes */}
        <Route path="orders" element={<div>Order History Coming Soon</div>} />
        <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
        <Route path="expenditure" element={<Expenditure/>} />
      </Route>
      <Route path="*" element={<Navigate to="/billing" replace />} />
    </Routes>
  );
};

export default AppRoutes;