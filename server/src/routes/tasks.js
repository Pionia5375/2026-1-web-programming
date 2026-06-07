import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const createSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  dueAt: z.coerce.date().optional().nullable(),
  priority: priorityEnum.optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  priority: priorityEnum.optional(),
  completed: z.boolean().optional(),
});

const listQuerySchema = z.object({
  completed: z.enum(['true', 'false']).optional(),
  priority: priorityEnum.optional(),
  q: z.string().max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const { completed, priority, q, from, to } = listQuerySchema.parse(req.query);
    const where = {
      userId: req.userId,
      ...(completed !== undefined && { completed: completed === 'true' }),
      ...(priority && { priority }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
      ...((from || to) && {
        dueAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    };
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ completed: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...data, userId: req.userId },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id, userId: req.userId },
      data,
    });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id, userId: req.userId },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
