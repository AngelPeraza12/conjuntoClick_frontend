import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Registro = () => {
  // Ajustamos el estado inicial con las claves exactas que requiere tu JSON
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    torre: '',
    apartamento: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', color: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envía el JSON estructurado exactamente con: nombre, email, password, torre, apartamento
      const response = await axios.post('http://localhost:3000/api/usuarios', formData);
      
      setMensaje({ texto: '¡Registro exitoso! Redirigiendo al login...', color: 'green' });
      
      // Esperamos 2 segundos y volvemos al Login
      setTimeout(() => navigate('/'), 2000);
      
    } catch (err) {
      setMensaje({ 
        texto: err.response?.data?.error || 'Error al registrar usuario', 
        color: 'red' 
      });
    }
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h2>Crea tu cuenta en ConjuntoClick 🏠</h2>
      <p>Regístrate para empezar a comprar en la tienda de tu conjunto.</p>

      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', maxWidth: '300px' }}>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre Completo:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Correo Electrónico (Email):</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label>Torre:</label>
            <input type="text" name="torre" value={formData.torre} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
          <div>
            <label>Apto:</label>
            <input type="text" name="apartamento" value={formData.apartamento} onChange={handleChange} required style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña (Password):</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        {mensaje.texto && <p style={{ color: mensaje.color, fontSize: '14px' }}>{mensaje.texto}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Registrarme
        </button>

        <p style={{ fontSize: '14px', marginTop: '15px', textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={() => navigate('/')} style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}>
            Inicia sesión
          </span>
        </p>
      </form>
    </div>
  );
};

export default Registro;