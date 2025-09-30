const { PrismaClient } = require('@prisma/client');
//afficher les requêtes dans la console
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;