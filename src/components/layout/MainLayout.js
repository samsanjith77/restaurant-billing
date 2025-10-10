import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

const MainLayout = () => {
  return (
    <>
      <Header />
      <Navigation />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default MainLayout;