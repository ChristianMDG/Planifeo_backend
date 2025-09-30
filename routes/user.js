const express = require('express');
const authenticateToken = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();
// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, userController.getProfile);

module.exports = router;