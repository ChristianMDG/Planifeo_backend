const express = require('express');
const authenticateToken = require('../middleware/auth');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

// Routes pour les résumés financiers
router.get('/monthly', authenticateToken, summaryController.getMonthlySummary);

// Résumé personnalisé basé sur les paramètres de requête (par exemple, plage de dates, catégories)
router.get('/', authenticateToken, summaryController.getCustomSummary);

// Alerte de dépassement de budget
router.get('/alerts', authenticateToken, summaryController.getBudgetAlerts);

// Tendance des dépenses mensuelles
router.get('/monthly-trend', authenticateToken, summaryController.getMonthlyTrend);

module.exports = router;