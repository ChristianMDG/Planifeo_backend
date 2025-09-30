const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authController = {
    signup: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Verifie si l'utilisateur existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hasher le mot de passe 
            const hashedPassword = await bcrypt.hash(password, 12);

            // Créer des catégories par défaut pour le nouveau utilisateur
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    categories: {
                        create: [
                            { name: 'Food' },
                            { name: 'Transportation' },
                            { name: 'Entertainment' },
                            { name: 'Utilities' },
                            { name: 'Rent' },
                            { name: 'Healthcare' }
                        ]
                    }
                }
            });

            // Générer un token pour l'utilisateur
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User created successfully',
                token,
                user: { id: user.id, email: user.email }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Rechercher l'utilisateur dans kla base de donnée
            const user = await prisma.user.findUnique({
                where: { email },
                include: { categories: true }
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Comparer le mot de passe Hasher et l'autre
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Générer le token pour l'utilisateur
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, email: user.email, categories: user.categories }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = authController;