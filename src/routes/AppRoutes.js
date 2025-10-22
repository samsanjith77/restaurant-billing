import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Layout from '../components/layout/Layout';
import RestaurantBilling from '../pages/RestaurantBilling';
import DishManagement from '../pages/DishManagement';
import OrderHistory from '../pages/OrderHistory';
import Expenditure from '../pages/Expenditure';
import Analytics from '../pages/Analytics'; // NEW

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/billing" replace />} />
        <Route path="billing" element={<RestaurantBilling />} />
        <Route path="dishes" element={<DishManagement />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="expenditure" element={<Expenditure />} />
        <Route path="analytics" element={<Analytics />} /> {/* NEW */}
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
