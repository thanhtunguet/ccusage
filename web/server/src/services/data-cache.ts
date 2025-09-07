import { loadDailyUsageData, loadMonthlyUsageData, loadSessionData, loadSessionBlockData } from '../../../../src/data-loader.ts';
import type { DailyUsage, MonthlyUsage, SessionUsage, SessionBlock } from '../../../../src/data-loader.ts';

export type CostMode = 'auto' | 'calculate' | 'display';

interface CachedData {
	daily: Record<CostMode, DailyUsage[]>;
	monthly: Record<CostMode, MonthlyUsage[]>;
	sessions: Record<CostMode, SessionUsage[]>;
	blocks: Record<CostMode, SessionBlock[]>;
	lastUpdated: Date;
}

class DataCacheService {
	private cache: CachedData | null = null;
	private refreshInterval: NodeJS.Timeout | null = null;
	private isLoading = false;

	/**
	 * Initialize the cache and start periodic refresh
	 */
	async initialize(refreshIntervalMs = 5 * 60 * 1000): Promise<void> {
		console.log('🔄 Initializing data cache...');
		await this.refreshCache();
		
		// Set up periodic refresh (default: 5 minutes)
		this.refreshInterval = setInterval(() => {
			this.refreshCache().catch(error => {
				console.error('❌ Cache refresh failed:', error);
			});
		}, refreshIntervalMs);
		
		console.log(`✅ Data cache initialized with ${refreshIntervalMs / 1000}s refresh interval`);
	}

	/**
	 * Refresh all cached data
	 */
	async refreshCache(): Promise<void> {
		if (this.isLoading) {
			console.log('⏳ Cache refresh already in progress, skipping...');
			return;
		}

		this.isLoading = true;
		const startTime = Date.now();
		
		try {
			console.log('🔄 Refreshing data cache...');

			// Load data for all cost modes in parallel
			const [
				dailyAuto, dailyCalculate, dailyDisplay,
				monthlyAuto, monthlyCalculate, monthlyDisplay,
				sessionsAuto, sessionsCalculate, sessionsDisplay,
				blocksAuto, blocksCalculate, blocksDisplay
			] = await Promise.all([
				// Daily data
				loadDailyUsageData({ mode: 'auto' }),
				loadDailyUsageData({ mode: 'calculate' }),
				loadDailyUsageData({ mode: 'display' }),
				// Monthly data
				loadMonthlyUsageData({ mode: 'auto' }),
				loadMonthlyUsageData({ mode: 'calculate' }),
				loadMonthlyUsageData({ mode: 'display' }),
				// Session data
				loadSessionData({ mode: 'auto' }),
				loadSessionData({ mode: 'calculate' }),
				loadSessionData({ mode: 'display' }),
				// Blocks data
				loadSessionBlockData({ mode: 'auto' }),
				loadSessionBlockData({ mode: 'calculate' }),
				loadSessionBlockData({ mode: 'display' }),
			]);

			this.cache = {
				daily: {
					auto: dailyAuto,
					calculate: dailyCalculate,
					display: dailyDisplay,
				},
				monthly: {
					auto: monthlyAuto,
					calculate: monthlyCalculate,
					display: monthlyDisplay,
				},
				sessions: {
					auto: sessionsAuto,
					calculate: sessionsCalculate,
					display: sessionsDisplay,
				},
				blocks: {
					auto: blocksAuto,
					calculate: blocksCalculate,
					display: blocksDisplay,
				},
				lastUpdated: new Date(),
			};

			const duration = Date.now() - startTime;
			console.log(`✅ Cache refreshed in ${duration}ms`);
		} catch (error) {
			console.error('❌ Failed to refresh cache:', error);
			throw error;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Get daily usage data from cache
	 */
	getDailyUsage(mode: CostMode = 'auto'): DailyUsage[] {
		if (!this.cache) {
			throw new Error('Cache not initialized');
		}
		return this.cache.daily[mode];
	}

	/**
	 * Get monthly usage data from cache
	 */
	getMonthlyUsage(mode: CostMode = 'auto'): MonthlyUsage[] {
		if (!this.cache) {
			throw new Error('Cache not initialized');
		}
		return this.cache.monthly[mode];
	}

	/**
	 * Get session usage data from cache
	 */
	getSessionUsage(mode: CostMode = 'auto'): SessionUsage[] {
		if (!this.cache) {
			throw new Error('Cache not initialized');
		}
		return this.cache.sessions[mode];
	}

	/**
	 * Get blocks usage data from cache
	 */
	getBlocksUsage(mode: CostMode = 'auto'): SessionBlock[] {
		if (!this.cache) {
			throw new Error('Cache not initialized');
		}
		return this.cache.blocks[mode];
	}

	/**
	 * Get cache status
	 */
	getCacheStatus() {
		return {
			initialized: this.cache !== null,
			isLoading: this.isLoading,
			lastUpdated: this.cache?.lastUpdated,
			dataPoints: this.cache ? {
				daily: Object.values(this.cache.daily).reduce((sum, data) => sum + data.length, 0),
				monthly: Object.values(this.cache.monthly).reduce((sum, data) => sum + data.length, 0),
				sessions: Object.values(this.cache.sessions).reduce((sum, data) => sum + data.length, 0),
				blocks: Object.values(this.cache.blocks).reduce((sum, data) => sum + data.length, 0),
			} : null,
		};
	}

	/**
	 * Manual cache refresh endpoint
	 */
	async forceRefresh(): Promise<void> {
		await this.refreshCache();
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}
		this.cache = null;
		console.log('🧹 Data cache destroyed');
	}
}

// Export singleton instance
export const dataCacheService = new DataCacheService();