import { Hono } from 'hono';
import { dailyRoutes } from './daily.ts';
import { monthlyRoutes } from './monthly.ts';
import { sessionRoutes } from './session.ts';
import { blocksRoutes } from './blocks.ts';
import { liveRoutes } from './live.ts';

export const apiRoutes = new Hono();

// Mount sub-routes
apiRoutes.route('/daily', dailyRoutes);
apiRoutes.route('/monthly', monthlyRoutes);
apiRoutes.route('/session', sessionRoutes);
apiRoutes.route('/blocks', blocksRoutes);
apiRoutes.route('/live', liveRoutes);

// API info endpoint
apiRoutes.get('/', (c) => {
	return c.json({
		name: 'ccusage Web API',
		version: '1.0.0',
		endpoints: {
			daily: '/api/daily',
			monthly: '/api/monthly',
			session: '/api/session',
			blocks: '/api/blocks',
			live: '/api/live',
		},
	});
});