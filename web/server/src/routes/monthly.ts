import { Hono } from 'hono';
import { createMonthlyApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';
import { dataCacheService } from '../services/data-cache.ts';

export const monthlyRoutes = new Hono();

// GET /api/monthly - Get monthly usage data
monthlyRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		// Get data from cache instead of loading from disk
		const usageData = dataCacheService.getMonthlyUsage(query.mode || 'auto');

		const response = createMonthlyApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading monthly data:', error);
		return c.json({ 
			error: 'Failed to load monthly usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/monthly/summary - Get monthly summary statistics
monthlyRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		// Get data from cache instead of loading from disk
		const usageData = dataCacheService.getMonthlyUsage(query.mode || 'auto');

		const totalMonths = usageData.length;
		const totalCost = usageData.reduce((sum, month) => sum + month.totalCost, 0);
		const totalTokens = usageData.reduce((sum, month) => 
			sum + month.inputTokens + month.outputTokens + month.cacheCreationTokens + month.cacheReadTokens, 0);
		const avgCostPerMonth = totalMonths > 0 ? totalCost / totalMonths : 0;
		
		return c.json({
			totalMonths,
			totalCost,
			totalTokens,
			avgCostPerMonth,
			dateRange: {
				from: usageData[0]?.month,
				to: usageData[usageData.length - 1]?.month,
			},
		});
	} catch (error) {
		console.error('Error loading monthly summary:', error);
		return c.json({ 
			error: 'Failed to load monthly summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});