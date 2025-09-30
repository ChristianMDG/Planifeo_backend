const express = require('express');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// Routes pour gérer les dépenses
router.get('/', authenticateToken, expenseController.getAllExpenses);

// Crée une nouvelle dépense, avec possibilité de télécharger un reçu
router.post('/', authenticateToken, upload.single('receipt'), expenseController.createExpense);

// Récupère, met à jour ou supprime une dépense spécifique par son ID
router.get('/:id', authenticateToken, expenseController.getExpenseById);

// Met à jour une dépense spécifique, avec possibilité de mettre à jour le reçu
router.put('/:id', authenticateToken, upload.single('receipt'), expenseController.updateExpense);

// Supprime une dépense spécifique par son ID
router.delete('/:id', authenticateToken, expenseController.deleteExpense);
module.exports = router;