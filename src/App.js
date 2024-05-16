import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import BrowserRouter and use it as Router
import BasicDatePicker from './Components/BasicDatePicker';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<BasicDatePicker />} />
       
        </Routes>
      </Router>
    </div>
  );
}

export default App;
