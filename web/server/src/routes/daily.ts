import { Hono } from 'hono';
import { createDailyApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';
import { dataCacheService } from '../services/data-cache.ts';

export const dailyRoutes = new Hono();

// GET /api/daily - Get daily usage data
dailyRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		// Get data from cache instead of loading from disk
		const cachedData = dataCacheService.getDailyUsage(query.mode || 'auto');
		
		// Apply client-side filtering since cache contains all data
		let usageData = cachedData;
		
		// TODO: Implement client-side filtering for dateRange, projectFilter, modelFilter, sortOrder
		// For now, return all cached data

		const response = createDailyApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading daily data:', error);
		return c.json({ 
			error: 'Failed to load daily usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/daily/summary - Get daily summary statistics  
dailyRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		// Get data from cache instead of loading from disk
		const usageData = dataCacheService.getDailyUsage(query.mode || 'auto');

		// Calculate summary statistics
		const totalDays = usageData.length;
		const totalCost = usageData.reduce((sum, day) => sum + (day.totalCost || 0), 0);
		const totalTokens = usageData.reduce((sum, day) => sum + (
			(day.totalTokens || 0) + 
			(day.inputTokens || 0) + 
			(day.outputTokens || 0) + 
			(day.cacheCreationTokens || 0) + 
			(day.cacheReadTokens || 0)
		), 0);
		const avgCostPerDay = totalDays > 0 ? totalCost / totalDays : 0;
		
		return c.json({
			totalDays,
			totalCost,
			totalTokens,
			avgCostPerDay,
			dateRange: {
				from: usageData[0]?.date,
				to: usageData[usageData.length - 1]?.date,
			},
		});
	} catch (error) {
		console.error('Error loading daily summary:', error);
		return c.json({ 
			error: 'Failed to load daily summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});