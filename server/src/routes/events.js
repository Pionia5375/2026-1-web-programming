import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const baseSchema = z.object({
  title: z.string().min(1).max(120),
  location: z.string().max(200).optional().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
});

const createSchema = baseSchema.refine((v) => v.endAt >= v.startAt, {
  message: 'endAt must be greater than or equal to startAt',
  path: ['endAt'],
});

const updateSchema = baseSchema.partial().refine(
  (v) => {
    if (v.startAt && v.endAt) return v.endAt >= v.startAt;
    return true;
  },
  { message: 'endAt must be greater than or equal to startAt', path: ['endAt'] }
);

const listQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().max(120).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const { from, to, q } = listQuerySchema.parse(req.query);
    const where = {
      userId: req.userId,
      ...((from || to) && {
        startAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    };
    const events = await prisma.event.findMany({
      where,
      orderBy: [{ startAt: 'asc' }],
    });
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const event = await prisma.event.create({
      data: { ...data, userId: req.userId },
    });
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const event = await prisma.event.update({
      where: { id: req.params.id, userId: req.userId },
      data,
    });
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id, userId: req.userId },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
