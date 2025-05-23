const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB(app);

// Init Middleware
app.use(express.json());

// Import routes
const itemsRouter = require('./routes/api/items');

// Mount routers
app.use('/api/items', itemsRouter);

// 404 Handler (Catch-all for undefined routes)
app.use((req, res, next) => {
  res.status(404).json({ msg: 'Route not found' });
});

const port = process.env.PORT || 3000;

// The basic app.get('/') route should be removed or placed before the 404 handler
// if it's meant to be a valid route. For now, assuming /api/items is the main focus.
// If you want to keep a root path, define it before this 404 handler.
// For example:
// app.get('/', (req, res) => res.send('API Root'));
// Removing the original app.get('/') as it would be caught by the 404 handler if placed after.
// If a root path is desired, it should be defined before the 404 handler.

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
