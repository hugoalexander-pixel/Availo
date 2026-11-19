import { redactSensitiveData } from '../src/utils/logger';
import { requestLogger } from '../src/middleware/requestLogger';
import { errorHandler } from '../src/middleware/errorHandler';

describe('Logging & Redaction Utilities', () => {
  test('redaksi_menyembunyikan_password_dan_token_pada_objek', () => {
    const rawData = {
      name: 'Budi',
      password: 'superSecretPassword123',
      token: 'jwt.token.value',
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      profile: {
        email: 'budi@kampus.ac.id',
        secret: 'mySecretKey',
      },
    };

    const sanitized = redactSensitiveData(rawData);

    expect(sanitized.name).toBe('Budi');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.authorization).toBe('[REDACTED]');
    expect(sanitized.profile.email).toBe('budi@kampus.ac.id');
    expect(sanitized.profile.secret).toBe('[REDACTED]');
  });

  test('redaksi_menyembunyikan_token_bearer_pada_string', () => {
    const rawString = 'Header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const sanitized = redactSensitiveData(rawString);

    expect(sanitized).toBe('Header Authorization: Bearer [REDACTED]');
  });

  test('middleware_request_logger_menambahkan_request_id_dan_header', () => {
    const req: any = {
      headers: {},
      method: 'GET',
      url: '/api/facilities',
    };
    const res: any = {
      setHeader: jest.fn(),
      on: jest.fn(),
    };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(typeof req.requestId).toBe('string');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('middleware_request_logger_mempertahankan_incoming_request_id', () => {
    const customId = 'client-req-999888';
    const req: any = {
      headers: { 'x-request-id': customId },
      method: 'POST',
      url: '/api/reservations',
    };
    const res: any = {
      setHeader: jest.fn(),
      on: jest.fn(),
    };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(req.requestId).toBe(customId);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', customId);
  });

  test('error_handler_menyertakan_request_id_dalam_response_500', () => {
    const req: any = {
      requestId: 'req-err-1234',
      url: '/api/error-test',
      method: 'GET',
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      getHeader: jest.fn(),
    };
    const next = jest.fn();
    const testError = new Error('Database connection failed');

    errorHandler(testError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        RequestId: 'req-err-1234',
        Message: expect.any(String),
      })
    );
  });
});

