const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Helpers for EJS
app.locals.moment = require('moment');

// Routes
const dashboardRoutes = require('./routes/dashboard');
const tradeRoutes = require('./routes/trades');
const accountRoutes = require('./routes/accounts');
const payoutRoutes = require('./routes/payouts');
const purchaseRoutes = require('./routes/purchases');
const roiRoutes = require('./routes/roi');
const propFirmRoutes = require('./routes/propFirms');

app.use('/', dashboardRoutes);
app.use('/trades', tradeRoutes);
app.use('/accounts', accountRoutes);
app.use('/payouts', payoutRoutes);
app.use('/purchases', purchaseRoutes);
app.use('/roi', roiRoutes);
app.use('/propfirms', propFirmRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
