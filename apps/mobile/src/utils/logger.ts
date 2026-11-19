// Declaring __DEV__ fallback for environments without React Native globals (such as Node unit tests)
declare const __DEV__: boolean | undefined;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'refreshtoken',
  'accesstoken',
]);

export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
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

function isDev(): boolean {
  try {
    return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

function getTimestamp(): string {
  const d = new Date();
  const pad = (n: number, s = 2) => String(n).padStart(s, '0');
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  return `${dateStr} ${timeStr}`;
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

class AppLogger {
  debug(tag: string, message: string, meta?: any): void {
    if (!isDev()) return;
    const cleanMeta = meta ? redactSensitiveData(meta) : undefined;
    console.debug(`[${getTimestamp()}] [DEBUG] [${tag}] ${message}`, cleanMeta ?? '');
  }

  info(tag: string, message: string, meta?: any): void {
    if (!isDev()) return;
    const cleanMeta = meta ? redactSensitiveData(meta) : undefined;
    console.info(`[${getTimestamp()}] [INFO] [${tag}] ${message}`, cleanMeta ?? '');
  }

  warn(tag: string, message: string, meta?: any): void {
    const cleanMeta = meta ? redactSensitiveData(meta) : undefined;
    console.warn(`[${getTimestamp()}] [WARN] [${tag}] ${message}`, cleanMeta ?? '');
  }

  error(tag: string, message: string, error?: any, meta?: any): void {
    const cleanMeta = meta ? redactSensitiveData(meta) : undefined;
    console.error(`[${getTimestamp()}] [ERROR] [${tag}] ${message}`, error ?? '', cleanMeta ?? '');
  }

  // Khusus pencatatan navigasi antar layar
  screen(screenName: string, params?: any): void {
    this.info('NAV', `Navigasi ke layar: ${screenName}`, params);
  }
}

export const logger = new AppLogger();
