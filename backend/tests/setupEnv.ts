// Must run before any module imports config/env, which validates process.env on load.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/unused-in-tests';
process.env.JWT_SECRET = 'test-secret-test-secret-1234';
process.env.CORS_ORIGIN = 'http://localhost:5173';
