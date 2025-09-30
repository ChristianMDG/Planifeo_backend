require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const categoryRoutes = require('./routes/categories');
const summaryRoutes = require('./routes/summary');
const receiptRoutes = require('./routes/receipts');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: 'planifeomoney.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Planifeo backend is running 🚀");
});

// Middleware pour logger les requêtes multipart/form-data
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
    console.log('Multipart form data received');
  }
  next();
});

// statique pour les fichiers uploadés
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/user', userRoutes);

// globale erreur handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  
  if (error.message === 'Only JPG, PNG, and PDF files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});