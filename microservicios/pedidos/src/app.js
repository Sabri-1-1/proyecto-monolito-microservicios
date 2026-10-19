const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());

// Endpoint de salud requerido para las pruebas y Kubernetes
app.get('/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'pedidos' });
});

// Función para validar existencia de Usuario y Producto mediante HTTP fetch
async function validarReferencias(usuarioId, productoId) {
  const usuariosUrl = process.env.USUARIOS_URL || 'http://usuarios:3001';
  const productosUrl = process.env.PRODUCTOS_URL || 'http://productos:3002';

  try {
    const [resUsuario, resProducto] = await Promise.all([
      fetch(`${usuariosUrl}/usuarios/${usuarioId}`),
      fetch(`${productosUrl}/productos/${productoId}`)
    ]);

    if (resUsuario.status === 404 || resProducto.status === 404) {
      return false;
    }

    if (!resUsuario.ok || !resProducto.ok) {
      throw new Error('Error al consultar el servicio de Usuarios o Productos');
    }

    return true;
  } catch (error) {
    console.error('Error en validación inter-servicio:', error.message);
    throw error;
  }
}

// Obtener todos los pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

// Crear un nuevo pedido con validación cruzada
app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  if (![usuario_id, producto_id, cantidad].every(v => Number.isInteger(Number(v)) && Number(v) > 0)) {
    return res.status(400).json({ error: 'usuario_id, producto_id y cantidad deben ser enteros positivos' });
  }

  try {
    const esValido = await validarReferencias(usuario_id, producto_id);
    if (!esValido) {
      return res.status(400).json({ error: 'El usuario o producto indicado no existe' });
    }

    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, producto_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
});

module.exports = app;
