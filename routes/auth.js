const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
// Routes pour l'inscription et la connexion des utilisateurs
router.post('/signup', authController.signup);
// Route pour la connexion des utilisateurs
router.post('/login', authController.login);

module.exports = router;