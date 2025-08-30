import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/bun';
import { loadDailyUsageData } from '../../../../src/data-loader.ts';
import { parseApiQuery } from '../utils/query-parser.ts';

export const liveRoutes = new Hono();

// WebSocket endpoint for real-time updates
liveRoutes.get('/ws', upgradeWebSocket((c) => {
	return {
		onOpen(event, ws) {
			console.log('WebSocket connection opened');
			
			// Send initial data
			loadDailyUsageData({ mode: 'auto' })
				.then(data => {
					ws.send(JSON.stringify({
						type: 'initial',
						data: data.slice(-7), // Last 7 days
					}));
				})
				.catch(err => {
					console.error('Error loading initial data:', err);
				});

			// Set up interval to send updates every 30 seconds
			const interval = setInterval(async () => {
				try {
					const data = await loadDailyUsageData({ mode: 'auto' });
					ws.send(JSON.stringify({
						type: 'update',
						data: data.slice(-7), // Last 7 days
						timestamp: new Date().toISOString(),
					}));
				} catch (error) {
					console.error('Error sending live update:', error);
				}
			}, 30000);

			// Store interval reference
			(ws as any).updateInterval = interval;
		},

		onMessage(event, ws) {
			const message = JSON.parse(event.data.toString());
			
			if (message.type === 'subscribe') {
				// Handle subscription to specific data types
				console.log('Client subscribed to:', message.channels);
			}
		},

		onClose(event, ws) {
			console.log('WebSocket connection closed');
			
			// Clear interval
			if ((ws as any).updateInterval) {
				clearInterval((ws as any).updateInterval);
			}
		},

		onError(event, ws) {
			console.error('WebSocket error:', event);
		},
	};
}));

// REST endpoint for current live data
liveRoutes.get('/current', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		// Get today's data
		const usageData = await loadDailyUsageData({
			mode: query.mode,
			dateRange: {
				from: new Date().toISOString().split('T')[0], // Today
				to: new Date().toISOString().split('T')[0],   // Today
			},
		});

		return c.json({
			current: usageData[0] || null,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error loading current data:', error);
		return c.json({ 
			error: 'Failed to load current usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});