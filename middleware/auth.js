const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
// Middleware pour authentifier les requêtes en vérifiant le token JWT
const authenticateToken = async (req, res, next) => {
  // Récupère le token depuis les en-têtes de la requête
  const authHeader = req.headers['authorization'];
  // Le token est généralement envoyé sous la forme "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];
// Si pas de token, renvoie une erreur 401 (non autorisé)
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
// Vérifie et décode le token
  try {
// Si le token est valide, on récupère l'ID de l'utilisateur et on le cherche dans la base de données
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// Trouve l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;