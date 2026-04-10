const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'tradetracker-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Helpers for EJS
app.locals.moment = require('moment');
app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.username = req.session.username;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const tradeRoutes = require('./routes/trades');
const accountRoutes = require('./routes/accounts');
const payoutRoutes = require('./routes/payouts');
const purchaseRoutes = require('./routes/purchases');
const roiRoutes = require('./routes/roi');
const propFirmRoutes = require('./routes/propFirms');

app.use('/', authRoutes);
app.use('/', authMiddleware, dashboardRoutes);
app.use('/trades', authMiddleware, tradeRoutes);
app.use('/accounts', authMiddleware, accountRoutes);
app.use('/payouts', authMiddleware, payoutRoutes);
app.use('/purchases', authMiddleware, purchaseRoutes);
app.use('/roi', authMiddleware, roiRoutes);
app.use('/propfirms', authMiddleware, propFirmRoutes);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
