import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MockApiManager from './pages/MockApiManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<MockApiManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
