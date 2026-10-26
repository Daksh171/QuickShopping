
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../app';

describe('Health API', () => {
    it('GET /health/live should return HTTP 200 and status ok', async () => {
        const response = await request(app).get('/health/live');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body.timestamp).toBeDefined();
    });
});
