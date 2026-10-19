const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

describe('Pruebas del Monolito', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('GET /health debe responder con estado ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
});
