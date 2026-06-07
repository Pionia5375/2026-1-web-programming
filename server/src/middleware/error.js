import { ZodError } from 'zod';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Not Found' });
  }

  console.error('[error]', err);
  res.status(err.status ?? 500).json({
    error: err.message ?? 'Internal Server Error',
  });
}
