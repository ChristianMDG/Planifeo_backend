
const prisma = require('../config/database');

const incomeController = {
  // Récupère tous les revenus de l'utilisateur connecté avec des filtres optionnels
  getAllIncomes: async (req, res) => {
    try {
      const { start, end } = req.query;
      const userId = req.user.id;

      let whereClause = { userId };

      
      
      if (start && end) {
        whereClause.date = {
          gte: new Date(start),
          lte: new Date(end)
        };
      }

      const incomes = await prisma.income.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });

      res.status(200).json(incomes);
    } catch (error) {
      console.error('Get incomes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupère un revenu spécifique par son ID pour l'utilisateur connecté
  getIncomeById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const income = await prisma.income.findFirst({
        where: { id, userId }
      });

      if (!income) {
        return res.status(404).json({ error: 'Income not found' });
      }

      res.status(200).json(income);
    } catch (error) {
      console.error('Get income error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  // Crée un nouveau revenu pour l'utilisateur connecté
 createIncome: async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, date, source, description } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }

    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        source: source || null,
        description: description || null,
        userId
      }
    });

    // Inclure explicitement createdAt
    res.status(201).json({
      id: income.id,
      amount: income.amount,
      date: income.date,
      source: income.source,
      description: income.description,
      createdAt: income.createdAt,  
      userId: income.userId
    });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
},

//uptate un revenu existant pour l'utilisateur connecté
  updateIncome: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { amount, date, source, description } = req.body;

      const existingIncome = await prisma.income.findFirst({
        where: { id, userId }
      });

      if (!existingIncome) {
        return res.status(404).json({ error: 'Income not found' });
      }

      const updateData = {};
      if (amount) updateData.amount = parseFloat(amount);
      if (date) updateData.date = new Date(date);
      if (source !== undefined) updateData.source = source;
      if (description !== undefined) updateData.description = description;
      
      const updatedIncome = await prisma.income.update({
        where: { id },
        data: updateData
      });

      res.status(200).json(updatedIncome);
    } catch (error) {
      console.error('Update income error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  //supprimer une revenu existant pour l'utilisateur connecté
  deleteIncome: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const income = await prisma.income.findFirst({
        where: { id, userId }
      });

      if (!income) {
        return res.status(404).json({ error: 'Income not found' });
      }

      await prisma.income.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete income error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = incomeController;
