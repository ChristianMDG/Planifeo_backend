
const express = require('express');
const authenticateToken = require('../middleware/auth');
const incomeController = require('../controllers/incomeController');

const router = express.Router();

// Routes pour gérer les revenus
router.get('/', authenticateToken, incomeController.getAllIncomes);

// Crée un nouveau revenu
router.post('/', authenticateToken, incomeController.createIncome);

// Récupère, met à jour ou supprime un revenu spécifique par son ID
router.get('/:id', authenticateToken, incomeController.getIncomeById);

// Met à jour un revenu spécifique
router.put('/:id', authenticateToken, incomeController.updateIncome);

// Supprime un revenu spécifique par son ID
router.delete('/:id', authenticateToken, incomeController.deleteIncome);
module.exports = router;