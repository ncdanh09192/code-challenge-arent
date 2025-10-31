import request from 'supertest';
import app from '../src/server.js';

describe('Health Check', () => {
  it('should return 200 on health endpoint', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('API Routes', () => {
  it('should return 404 for unknown route', async () => {
    const response = await request(app)
      .get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
