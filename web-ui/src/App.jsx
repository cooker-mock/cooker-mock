import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MockApiManager from './pages/MockApiManager';
import UserSimulation from './pages/UserSimulation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<MockApiManager />} />
          <Route path="/user-simulation" element={<UserSimulation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
