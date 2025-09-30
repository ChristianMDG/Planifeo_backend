const prisma = require('../config/database');

const expenseController = {

  // Récupère toutes les dépenses de l'utilisateur connecté avec des filtres optionnels
  getAllExpenses: async (req, res) => {
    try {
      const { start, end, category, type } = req.query;
      const userId = req.user.id;

      let whereClause = { userId };

      if (start && end) {
        whereClause.OR = [
          {
            type: 'one-time',
            date: {
              gte: new Date(start),
              lte: new Date(end)
            }
          },
          {
            type: 'recurring',
            OR: [
              {
                AND: [
                  { startDate: { lte: new Date(end) } },
                  { endDate: null }
                ]
              },
              {
                AND: [
                  { startDate: { lte: new Date(end) } },
                  { endDate: { gte: new Date(start) } }
                ]
              }
            ]
          }
        ];
      }

      if (category) {
        whereClause.categoryId = category;
      }

      if (type) {
        whereClause.type = type;
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        orderBy: { date: 'desc' }
      });

     
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupère une dépense spécifique par son ID pour l'utilisateur connecté
  getExpenseById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expense = await prisma.expense.findFirst({
        where: { id, userId },
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.status(200).json(expense);
    } catch (error) {
      console.error('Get expense error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  //creer une nouvelle dépense pour l'utilisateur connecté
  createExpense: async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, date, categoryId, description, type, startDate, endDate } = req.body;
      const receipt = req.file ? req.file.filename : null;

      if (!amount || !categoryId) {
        return res.status(400).json({ error: 'Amount and category are required' });
      }

      if (type === 'one-time' && !date) {
        return res.status(400).json({ error: 'Date is required for one-time expenses' });
      }

      if (type === 'recurring' && !startDate) {
        return res.status(400).json({ error: 'Start date is required for recurring expenses' });
      }

      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId }
      });

      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      const expenseData = {
        amount: parseFloat(amount),
        categoryId,
        description: description || null,
        type: type || 'one-time',
        userId,
        receipt,
        createdAt: new Date() // <-- Ajout de createdAt
      };

      if (type === 'one-time') {
        expenseData.date = new Date(date);
        expenseData.startDate = null;
        expenseData.endDate = null;
      } else if (type === 'recurring') {
        expenseData.date = null;
        expenseData.startDate = new Date(startDate);
        if (endDate) expenseData.endDate = new Date(endDate);
      }

      const expense = await prisma.expense.create({
        data: expenseData,
        include: {
          category: { select: { id: true, name: true } }
        }
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

//update une dépense existante pour l'utilisateur connecté
  updateExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { amount, date, categoryId, description, type, startDate, endDate } = req.body;
      const receipt = req.file ? req.file.filename : undefined;

      const existingExpense = await prisma.expense.findFirst({
        where: { id, userId }
      });

      if (!existingExpense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      if (categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: categoryId, userId }
        });

        if (!category) {
          return res.status(400).json({ error: 'Invalid category' });
        }
      }

      const updateData = {};
      if (amount) updateData.amount = parseFloat(amount);
      if (categoryId) updateData.categoryId = categoryId;
      if (description !== undefined) updateData.description = description;
      if (type) updateData.type = type;
      if (receipt) updateData.receipt = receipt;

      if (type === 'one-time') {
        updateData.date = date ? new Date(date) : null;
        updateData.startDate = null;
        updateData.endDate = null;
      } else if (type === 'recurring') {
        updateData.date = null;
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      }

      const updatedExpense = await prisma.expense.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { id: true, name: true } }
        }
      });

      res.status(200).json(updatedExpense);
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  //supprimer une dépense existante pour l'utilisateur connecté
  deleteExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expense = await prisma.expense.findFirst({
        where: { id, userId }
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      await prisma.expense.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = expenseController;
