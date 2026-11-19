import winston from 'winston';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'refreshtoken',
  'accesstoken',
  'cookie',
]);

/**
 * Fungsi redaksi untuk menyaring password, token JWT, dan data sensitif
 */
export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact potential Bearer tokens in strings
    return data.replace(/Bearer\s+[A-Za-z0-9-_.~+/=]+/gi, 'Bearer [REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = redactSensitiveData(val);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  return data;
}

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Jalankan redaksi pada metadata
    return redactSensitiveData(info);
  })(),
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const reqStr = requestId ? ` [${requestId}]` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}]${reqStr}: ${message}${metaStr}`;
      })
);

export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
