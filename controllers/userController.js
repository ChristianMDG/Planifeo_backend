const prisma = require('../config/database');

const userController = {
  // Récupère le profil de l'utilisateur connecté
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
// Récupère les informations de l'utilisateur connecté
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              expenses: true,
              incomes: true,
              categories: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = userController;