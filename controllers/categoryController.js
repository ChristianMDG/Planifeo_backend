//On importe Prisma Client (déjà instancié dans ../config/database).
const prisma = require('../config/database');

const categoryController = {
    getAllCategories: async (req, res) => {
       //On récupère l’ID de l’utilisateur connecté à partir du token .
        const userId = req.user.id;
        try {
            //Requête Prisma pour chercher toutes les catégories où userId correspond à celui connecté.
            const categories = await prisma.category.findMany({
                where: { userId },
                orderBy: { name: 'asc' }
            });
            res.status(200).json(categories);
        }
        //retourne une erreur 500 si il y a une erreur
         catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    createCategory: async (req, res) => {
        try {
            const userId = req.user.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      // verifie si la categorie existe deja pour le user
      const existingCategory = await prisma.category.findFirst({
        where: { name, userId }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }
//creer une nouvelle ligne dans category
      const category = await prisma.category.create({
        data: {
          name,
          userId
        }
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

}
,updateCategory: async (req, res) => {
    try {
// on recupere l`id de la catégorie à modifier (dans l’URL),name depuis le formulaire et
// userId 
      const { id } = req.params;
      const userId = req.user.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const existingCategory = await prisma.category.findFirst({
        where: { id, userId }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // érifie si un autre enregistrement a déjà ce nom.
      // (On évite de permettre 2 catégories avec le même nom pour le même utilisateur.)
      const duplicateCategory = await prisma.category.findFirst({
        where: { name, userId, NOT: { id } }
      });
      //Si un doublon est trouvé, on refuse la modification.
      if (duplicateCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name }
      });

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      //Vérifie que la catégorie existe et appartient à l’utilisateur.
      const category = await prisma.category.findFirst({
        where: { id, userId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // vérifie si cette catégorie est liée à une dépense.
      const expensesWithCategory = await prisma.expense.findFirst({
        where: { categoryId: id }
      });

      if (expensesWithCategory) {
        return res.status(400).json({ error: 'Cannot delete category that is in use' });
      }

      await prisma.category.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

};
module.exports = categoryController;