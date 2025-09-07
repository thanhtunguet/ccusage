import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { apiRoutes } from './routes/api.ts';
import { dataCacheService } from './services/data-cache.ts';

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

// Cache status endpoint
app.get('/cache/status', (c) => {
	return c.json(dataCacheService.getCacheStatus());
});

// Manual cache refresh endpoint
app.post('/cache/refresh', async (c) => {
	try {
		await dataCacheService.forceRefresh();
		return c.json({ message: 'Cache refreshed successfully', timestamp: new Date().toISOString() });
	} catch (error) {
		console.error('Manual cache refresh failed:', error);
		return c.json({ 
			error: 'Failed to refresh cache',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
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

async function startServer() {
	try {
		console.log(`🚀 ccusage web server starting on port ${port}`);
		
		// Initialize data cache before starting server
		await dataCacheService.initialize();
		
		console.log(`🎯 Server ready at http://localhost:${port}`);
		
		serve({
			fetch: app.fetch,
			port,
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
}

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('🛑 SIGTERM received, shutting down gracefully');
	dataCacheService.destroy();
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('🛑 SIGINT received, shutting down gracefully');
	dataCacheService.destroy();
	process.exit(0);
});

startServer();