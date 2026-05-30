import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);

  // 1. Cargar productos desde tu backend
  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 2. Lógica para añadir productos al carrito usando 'id_producto'
  const agregarAlCarrito = (producto) => {
    // 🔥 CORREGIDO: Usamos id_producto
    const existe = carrito.find((item) => item.id_producto === producto.id_producto);
    
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(
          carrito.map((item) =>
            item.id_producto === producto.id_producto
              ? { ...existe, cantidad: existe.cantidad + 1 }
              : item
          )
        );
      } else {
        alert(`Lo sentimos, solo hay ${producto.stock} unidades disponibles.`);
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // 3. Modificar cantidades dentro del carrito usando 'id_producto'
  const cambiarCantidad = (id_producto, accion) => {
    const productoCarrito = carrito.find((item) => item.id_producto === id_producto);
    const productoOriginal = productos.find((item) => item.id_producto === id_producto);

    if (accion === 'sumar') {
      if (productoCarrito.cantidad < productoOriginal.stock) {
        setCarrito(carrito.map(item => item.id_producto === id_producto ? { ...item, cantidad: item.cantidad + 1 } : item));
      }
    } else if (accion === 'restar') {
      if (productoCarrito.cantidad > 1) {
        setCarrito(carrito.map(item => item.id_producto === id_producto ? { ...item, cantidad: item.cantidad - 1 } : item));
      } else {
        setCarrito(carrito.filter(item => item.id_producto !== id_producto));
      }
    }
  };

  // 4. Eliminar por completo un ítem del carrito usando 'id_producto'
  const eliminarDelCarrito = (id_producto) => {
    setCarrito(carrito.filter(item => item.id_producto !== id_producto));
  };

  // 🔥 CORREGIDO: Procesar Pedido, Detalle de Pedidos y Descontar Stock
  const procesarCompra = async () => {
    const datosSesion = JSON.parse(localStorage.getItem('usuario'));

    if (!datosSesion) {
      alert("⚠️ Error: Debes iniciar sesión primero para realizar un pedido.");
      return;
    }

    // Extraemos el identificador numérico del usuario logueado
    const idUsuarioValido = datosSesion.id_usuario || datosSesion.id;

    if (!idUsuarioValido) {
      alert("⚠️ Error: No se detectó un ID de usuario válido en la sesión. Verifica tu Login.");
      return;
    }

    // 🔥 CORREGIDO: Enviamos 'id_usuario' para calzar con la columna física de MySQL
    const datosPedido = {
      id_usuario: parseInt(idUsuarioValido, 10),
      total: totalCarrito,
      estado: 'pendiente'
    };

    try {
      // Paso 1: Guardamos la cabecera del pedido (Aquí daba el error 500)
      const responsePedido = await axios.post('http://localhost:3000/api/pedidos', datosPedido);

      if (responsePedido.status === 201 || responsePedido.status === 200) {
        const idPedidoGenerado = responsePedido.data.id; 
        
        // Paso 2: Guardamos el desglose de productos e impactamos inventario
        const promesasCompra = carrito.map((item) => {
          
          // A. Registro ordenado en detalle_pedidos
          const guardarDetalle = axios.post('http://localhost:3000/api/detalles', {
            id_pedido: idPedidoGenerado,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio
          });

          // B. Descuento de stock en la tabla de productos
          const descontarInventario = axios.post('http://localhost:3000/api/productos/descontar-stock', {
            id: item.id_producto,
            cantidadComprada: item.cantidad
          });

          return Promise.all([guardarDetalle, descontarInventario]);
        });

        await Promise.all(promesasCompra);

        alert(`🎉 ¡Compra finalizada con éxito! Pedido N° #${idPedidoGenerado}`);
        
        setCarrito([]);
        cargarProductos(); 
      }
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      // Imprimimos el mensaje real enviado por MySQL para diagnosticar fallas de sintaxis
      alert(error.response?.data?.error || error.response?.data?.mensaje || "Hubo un error interno al guardar el pedido.");
    }
  };

  // 5. Filtrar productos según la barra de búsqueda
  const productosFiltrados = productos.filter((prod) =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 6. Calcular el total a pagar
  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1>Catálogo de la Tienda ConjuntoClick 🛒</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* GRILLA DE PRODUCTOS */}
        <div style={{ flex: '3', display: 'flex', gap: '20px', flexWrap: 'wrap', minWidth: '300px' }}>
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((prod) => (
              <div key={prod.id_producto} style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', backgroundColor: '#1e1e1e' }}>
                
                {prod.imagen_url ? (
                  <img src={prod.imagen_url} alt={prod.nombre} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                ) : (
                  <div style={{ width: '100%', height: '130px', backgroundColor: '#2d2d2d', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px', marginBottom: '10px', border: '1px dashed #555' }}>📦 Sin imagen</div>
                )}

                <h3 style={{ margin: '10px 0 5px 0', color: '#fff' }}>{prod.nombre}</h3>
                <p style={{ color: '#aaa', fontSize: '14px', flexGrow: '1', margin: '0 0 10px 0' }}>{prod.descripcion}</p>
                <p style={{ margin: '5px 0' }}><strong>Categoría:</strong> <span style={{ color: '#ccc' }}>{prod.categoria || 'General'}</span></p>
                <p style={{ margin: '5px 0' }}><strong>Precio:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>${prod.precio}</span></p>
                <p style={{ color: prod.stock > 0 ? '#28a745' : '#dc3545', margin: '5px 0' }}>
                  <strong>Disponibles:</strong> {prod.stock} unids.
                </p>
                
                <button
                  onClick={() => agregarAlCarrito(prod)}
                  disabled={prod.stock === 0}
                  style={{ width: '100%', padding: '8px', backgroundColor: prod.stock > 0 ? '#28a745' : '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: prod.stock > 0 ? 'pointer' : 'not-allowed', marginTop: '10px', fontWeight: 'bold' }}
                >
                  {prod.stock > 0 ? 'Agregar al carrito 🛒' : 'Agotado 🚫'}
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#aaa' }}>No se encontraron productos que coincidan con la búsqueda.</p>
          )}
        </div>

        {/* PANEL DEL CARRITO DE COMPRAS */}
        <div style={{ flex: '1', minWidth: '280px', border: '1px solid #444', padding: '20px', borderRadius: '8px', backgroundColor: '#1e1e1e', color: '#fff', alignSelf: 'flex-start' }}>
          <h2>Tu Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})</h2>
          <hr style={{ borderColor: '#444' }} />
          
          {carrito.length === 0 ? (
            <p style={{ color: '#777' }}>El carrito está vacío.</p>
          ) : (
            <>
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                {carrito.map((item) => (
                  <div key={item.id_producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #333' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{item.nombre}</h4>
                      <span style={{ fontSize: '14px', color: '#aaa' }}>
                        ${item.precio} x {item.cantidad} = <strong style={{ color: '#28a745' }}>${item.precio * item.cantidad}</strong>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <button onClick={() => cambiarCantidad(item.id_producto, 'restar')} style={{ padding: '2px 6px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id_producto, 'sumar')} style={{ padding: '2px 6px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>+</button>
                      <button onClick={() => eliminarDelCarrito(item.id_producto)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px', marginLeft: '5px' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <hr style={{ borderColor: '#444' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', margin: '15px 0' }}>
                <span>Total:</span>
                <span style={{ color: '#28a745' }}>${totalCarrito}</span>
              </div>

              <button
                onClick={procesarCompra}
                style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Finalizar Compra 🚀
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Tienda;