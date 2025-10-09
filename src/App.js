import React from 'react';
import Header from './components/layout/Header';
import RestaurantBilling from './pages/RestaurantBilling';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <RestaurantBilling />
      </main>
    </div>
  );
}

export default App;