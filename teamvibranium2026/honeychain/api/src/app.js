const express = require('express');
const cors = require('cors');

const actorsRoutes = require('./routes/actors');
const batchesRoutes = require('./routes/batches');
const transfersRoutes = require('./routes/transfers');
const qualityRoutes = require('./routes/quality');
const packagesRoutes = require('./routes/packages');
const alertsRoutes = require('./routes/alerts');
const chainRoutes = require('./routes/chain');
const publicRoutes = require('./routes/public');
const hivesRoutes = require('./routes/hives');
const telemetryRoutes = require('./routes/telemetry');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/actors', actorsRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/chain', chainRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/hives', hivesRoutes);
app.use('/api/telemetry', telemetryRoutes);

app.use((req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, req, res, next) => {
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ error: err && err.message ? err.message : 'internal server error' });
});

module.exports = app;
