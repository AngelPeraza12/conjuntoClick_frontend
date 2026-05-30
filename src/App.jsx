import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Tienda from './pages/Tienda';
import Registro from './pages/Registro'; // 1. Importa la nueva página

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/registro" element={<Registro />} /> {/* 2. Agrega la ruta */}
      </Routes>
    </Router>
  );
}

export default App;