const express = require('express');
//importer middleware d'authentification (probablement basé sur un JWT) depuis un fichier local ../middleware/auth.
//Ce middleware protège les routes, donc seuls les utilisateurs authentifiés peuvent les utiliser.
const authenticateToken = require('../middleware/auth');
//importer le contrôleur de catégories depuis un fichier local ../controllers/categoryController.
const categoryController = require('../controllers/categoryController');
//Créer une nouvelle instance de routeur Express.
const router = express.Router();

//But : Récupérer toutes les catégories
router.get('/', authenticateToken, categoryController.getAllCategories);

//Créer une nouvelle catégorie
router.post('/', authenticateToken, categoryController.createCategory);

//Modifier une catégorie existante, identifiée par son id
router.put('/:id', authenticateToken, categoryController.updateCategory);

//Supprimer une catégorie existante, identifiée par son id
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

//exporter le router pour l’utiliser dans un autre fichier, typiquement app.js,
module.exports = router;