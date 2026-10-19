const request = require('supertest');
const app = require('../src/app');

describe('Pruebas del Microservicio de Pedidos', () => {
  it('GET /health debe retornar estado ok', async () => {
    const res = await request(app).get('/health');
    // Cambiamos 200 por 500 para forzar el error en Jest
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('estado', 'ok');
  });
});
