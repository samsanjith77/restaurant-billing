import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Layout from '../components/layout/Layout';
import RestaurantBilling from '../pages/RestaurantBilling';
import DishManagement from '../pages/DishManagement';
import DishOrdering from '../pages/DishOrdering';
import OrderHistory from '../pages/OrderHistory';
import Expenditure from '../pages/Expenditure';
import Analytics from '../pages/Analytics';
import ReportPage from '../pages/ReportPage'; // NEW IMPORT

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/billing" replace />} />
        <Route path="billing" element={<RestaurantBilling />} />
        <Route path="dishes" element={<DishManagement />} />
        <Route path="dish-ordering" element={<DishOrdering />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="expenditure" element={<Expenditure />} />
        
        {/* Report page - NEW ROUTE */}
        <Route path="report" element={<ReportPage />} />
        
        {/* Admin-only routes */}
        <Route path="analytics" element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        } />
        <Route path="register" element={
          <AdminRoute>
            <Register />
          </AdminRoute>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
