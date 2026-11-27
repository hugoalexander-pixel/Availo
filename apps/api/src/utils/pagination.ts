export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  if (raw === undefined) {
    return fallback;
  }

  if (typeof raw === 'number') {
    if (!Number.isInteger(raw) || raw < 1) {
      throw new Error('INVALID_PAGINATION');
    }
    return raw;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error('INVALID_PAGINATION');
    }
    const parsed = Number(trimmed);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new Error('INVALID_PAGINATION');
    }
    return parsed;
  }

  throw new Error('INVALID_PAGINATION');
}

/**
 * Mem-parsing dan memvalidasi parameter pagination (page & limit).
 * Mengembalikan null jika kedua parameter tidak diberikan (kompatibilitas tanpa pagination).
 */
export function parsePaginationParams(rawPage?: unknown, rawLimit?: unknown): ParsedPagination | null {
  if (rawPage === undefined && rawLimit === undefined) {
    return null;
  }

  const page = parsePositiveInt(rawPage, DEFAULT_PAGE);
  const rawParsedLimit = parsePositiveInt(rawLimit, DEFAULT_LIMIT);
  const limit = Math.min(rawParsedLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Menghitung metadata pagination untuk response API.
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
  };
}
