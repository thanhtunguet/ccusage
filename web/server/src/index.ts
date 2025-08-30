import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { apiRoutes } from './routes/api.ts';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
	origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server + potential custom ports
	credentials: true,
}));

// Routes
app.route('/api', apiRoutes);

// Health check
app.get('/health', (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
	console.error('Server error:', err);
	return c.json({ error: 'Internal server error' }, 500);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

console.log(`🚀 ccusage web server starting on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});