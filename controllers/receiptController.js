const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');

const receiptController = {
  // Récupère le reçu (fichier) associé à une dépense spécifique pour l'utilisateur connecté
  getReceipt: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Trouver la dépense associée à l'ID et à l'utilisateur connecté
      const expense = await prisma.expense.findFirst({
        where: { id, userId }
      });

      if (!expense || !expense.receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }

      const filePath = path.join(__dirname, '../uploads', expense.receipt);

      // Vérifie si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Receipt file not found' });
      }

      // Détermine le type de contenu en fonction de l'extension du fichier
      const ext = path.extname(expense.receipt).toLowerCase();
      let contentType = 'application/octet-stream';

      if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      }

     // Envoie le fichier en réponse
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${expense.receipt}"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Get receipt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = receiptController;