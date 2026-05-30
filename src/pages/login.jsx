import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // Cambiado a email y password para hacer match con tu nueva estructura
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos el JSON con email y password
      const response = await axios.post('http://localhost:3000/api/usuarios/login', formData);
      
        // Cuando el login es exitoso en tu Login.jsx:
      if (response.data) {
        // Guardamos todo el objeto del usuario que retorna el backend (el cual debe incluir su id numérico)
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        navigate('/tienda');
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Bienvenido a ConjuntoClick 🚀</h2>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
        <div>
          <label>Correo Electrónico (Email):</label><br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <br />
        <div>
          <label>Contraseña (Password):</label><br />
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          <button type="submit" style={{ cursor: 'pointer' }}>Ingresar</button>
          
          <p style={{ fontSize: '14px', margin: '0', textAlign: 'center' }}>
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('/registro')} style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}>
              Regístrate aquí
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;