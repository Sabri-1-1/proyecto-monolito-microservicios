const request = require('supertest');
const app = require('../src/app');

describe('Pruebas del Microservicio de Pedidos', () => {
  it('GET /health debe retornar estado ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('estado', 'ok');
  });
});
