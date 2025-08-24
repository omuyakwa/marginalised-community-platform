const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Mock the email service
jest.mock('../services/emailService', () => ({
  send2FAMagicLink: jest.fn().mockResolvedValue(),
}));

let mongoServer;
let server;
let port;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Start server on a random available port
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, () => {
    port = server.address().port;
    resolve();
  }));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await new Promise(resolve => server.close(resolve));
});

beforeEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

const makeRequest = (path, options) => {
  const url = `http://localhost:${port}${path}`;
  return fetch(url, options);
};

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    locale: 'en',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });
      const body = await res.json();

      expect(res.status).toEqual(201);
      expect(body.message).toBe('User registered successfully.');
      expect(body.user.email).toBe(testUser.email);

      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser).not.toBeNull();
    });

    it('should return 409 if email is already in use', async () => {
      // First, create the user
      await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      // Then, try to create them again
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });
      const body = await res.json();

      expect(res.status).toEqual(409);
      expect(body.message).toBe('Email already in use');
    });

    it('should return 400 for invalid input', async () => {
      const res = await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', password: 'short' }),
      });
      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register the user before trying to log in
      await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });
    });

    it('should return 200 and trigger a magic link on successful login', async () => {
      const res = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password }),
      });
      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.message).toContain('Check your email for a magic link');

      expect(emailService.send2FAMagicLink).toHaveBeenCalledTimes(1);
      expect(emailService.send2FAMagicLink).toHaveBeenCalledWith(testUser.email, expect.any(String));

      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser.twoFactor.pending).toBe(true);
      expect(dbUser.twoFactor.tokenHash).not.toBeNull();
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
      });
      const body = await res.json();

      expect(res.status).toEqual(401);
      expect(body.message).toBe('Invalid email or password');
      expect(emailService.send2FAMagicLink).not.toHaveBeenCalled();
    });
  });
});
