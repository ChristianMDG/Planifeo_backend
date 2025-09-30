const prisma = require('../config/database');

const calculateMonthlySummary = async (userId, month) => {
  const date = month ? new Date(month) : new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);


  const incomes = await prisma.income.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  //recupere toutes les dépenses pour la période (ponctuelles et récurrentes)
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      OR: [
        // Dépenses ponctuelles dans la période
        {
          type: 'one-time',
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        // Dépenses récurrentes actives pendant la période
        {
          type: 'recurring',
          OR: [
            {
              AND: [
                { startDate: { lte: endOfMonth } },
                { endDate: null }
              ]
            },
            {
              AND: [
                { startDate: { lte: endOfMonth } },
                { endDate: { gte: startOfMonth } }
              ]
            }
          ]
        }
      ]
    },
    include: {
      category: {
        select: { name: true }
      }
    }
  });
// Calcule le total des dépenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

// Regroupe les dépenses par catégorie
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const categoryName = expense.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += expense.amount;
    return acc;
  }, {});

  return {
    period: {
      start: startOfMonth,
      end: endOfMonth
    },
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    incomeCount: incomes.length,
    expenseCount: expenses.length
  };
};

// Contrôleur pour les résumés financiers
const summaryController = {
  getMonthlySummary: async (req, res) => {
    try {
      const userId = req.user.id;
      const { month } = req.query;

      const summary = await calculateMonthlySummary(userId, month);

      res.status(200).json(summary);
    } catch (error) {
      console.error('Get monthly summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Récupère un résumé personnalisé pour une période donnée
  getCustomSummary: async (req, res) => {
    try {
      const userId = req.user.id;
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ error: 'Start and end dates are required' });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Récupère tous les revenus pour la période
      const incomes = await prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });
// Calcule le total des revenus
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

      // Récupère toutes les dépenses (ponctuelles et récurrentes) pour la période
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          OR: [
           // One-time depenses dans la période
            {
              type: 'one-time',
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            // Dépenses récurrentes actives pendant la période
            {
              type: 'recurring',
              OR: [
                {
                  AND: [
                    { startDate: { lte: endDate } },
                    { endDate: null }
                  ]
                },
                {
                  AND: [
                    { startDate: { lte: endDate } },
                    { endDate: { gte: startDate } }
                  ]
                }
              ]
            }
          ]
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });
// Calcule le total des dépenses
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const balance = totalIncome - totalExpenses;

      // Regroupe les dépenses par catégorie
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const categoryName = expense.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += expense.amount;
        return acc;
      }, {});

      const summary = {
        period: {
          start: startDate,
          end: endDate
        },
        totalIncome,
        totalExpenses,
        balance,
        expensesByCategory,
        incomeCount: incomes.length,
        expenseCount: expenses.length
      };

      res.status(200).json(summary);
    } catch (error) {
      console.error('Get custom summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Vérifie si l'utilisateur a dépassé son budget mensuel et renvoie une alerte si c'est le cas
  getBudgetAlerts: async (req, res) => {
    try {
      const userId = req.user.id;
      const summary = await calculateMonthlySummary(userId);

      if (summary.balance < 0) {
        res.status(200).json({
          alert: true,
          message: `You've exceeded your budget for this month by ${Math.abs(summary.balance)} Ar`,
          amountOver: Math.abs(summary.balance)
        });
      } else {
        res.status(200).json({
          alert: false,
          message: 'You are within your budget for this month'
        });
      }
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Récupère la tendance des revenus et dépenses sur les 6 derniers mois
getMonthlyTrend: async (req, res) => {
  try {
    const userId = req.user.id;
    const monthsToShow = 6; 
    const today = new Date();
    const monthlyData = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const summary = await calculateMonthlySummary(userId, date);

      monthlyData.push({
        month: date.toLocaleString("default", { month: "short" }),
        income: summary.totalIncome,
        expenses: summary.totalExpenses
      });
    }

    res.status(200).json(monthlyData);

  } catch (error) {
    console.error('Get monthly trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


};

module.exports = summaryController;