const prisma = require('../db/prisma');

function normalizeId(id) {
  const numericId = Number(id);
  return Number.isInteger(numericId) ? numericId : null;
}

function handleConstraintError(error) {
  if (!error || !['P2002', 'P2003', 'P2011', 'P2014'].includes(error.code)) {
    throw error;
  }

  const conflict = new Error('The request conflicts with existing data');
  conflict.statusCode = 409;
  throw conflict;
}

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  const numericId = normalizeId(id);
  if (numericId === null) return null;
  return prisma.post.findUnique({ where: { id: numericId } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: fields.authorId,
      },
    });
  } catch (error) {
    handleConstraintError(error);
  }
}

async function update(id, patch) {
  const numericId = normalizeId(id);
  if (numericId === null) return null;

  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    return await prisma.post.update({ where: { id: numericId }, data });
  } catch (error) {
    if (error && error.code === 'P2025') return null;
    handleConstraintError(error);
  }
}

async function remove(id) {
  const numericId = normalizeId(id);
  if (numericId === null) return false;

  const result = await prisma.post.deleteMany({ where: { id: numericId } });
  return result.count > 0;
}

module.exports = { findAll, findById, create, update, remove };
