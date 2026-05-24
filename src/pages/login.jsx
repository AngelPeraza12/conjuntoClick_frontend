import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // 1. Estado para los campos del formulario
  const [formData, setFormData] = useState({
    email: '',
    torre: '',
    apto: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 2. Manejador de cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Lógica de envío y validación
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación de negocio: Torres 1-16
    const torreNum = parseInt(formData.torre);
    if (isNaN(torreNum) || torreNum < 1 || torreNum > 16) {
      setError('⚠️ La torre debe estar entre la 1 y la 16.');
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Disparamos la petición al backend (ajusta la URL según tu puerto)
      const response = await axios.post('http://localhost:3000/api/login', formData);

      if (response.status === 200) {
        // Guardamos los datos del usuario en localStorage para persistencia básica
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirigimos a la tienda
        navigate('/tienda');
      }
    } catch (err) {
      // Manejo de errores del Paso 2 y 3 (Puerta de entrada y Control de Tráfico)
      setError('❌ Error al ingresar. Verifica tus datos o el estado del servidor.');
      console.error("Error en login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Bienvenido a ConjuntoClick</h2>
        <p>Identifícate como residente</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            name="email" 
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Torre</label>
            <input 
              type="number" 
              name="torre" 
              placeholder="1-16"
              value={formData.torre}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Apartamento</label>
            <input 
              type="text" 
              name="apto" 
              placeholder="101"
              value={formData.apto}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
