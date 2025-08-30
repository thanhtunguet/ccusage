import axios from 'axios';

// API base URL - in production, this could be configurable
const API_BASE_URL = '/api';

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
	(config) => {
		console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error('API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// Types for API responses
export interface ApiResponse<T> {
	data: T;
	meta: {
		total: number;
		query: any;
		timestamp: string;
	};
}

export interface DailyUsageData {
	date: string;
	totalCostUSD: number;
	totalTokens: number;
	modelBreakdown: ModelBreakdown[];
	projects?: ProjectBreakdown[];
}

export interface MonthlyUsageData {
	month: string;
	totalCostUSD: number;
	totalTokens: number;
	modelBreakdown: ModelBreakdown[];
	projects?: ProjectBreakdown[];
}

export interface SessionUsageData {
	sessionId: string;
	projectPath: string;
	lastActivity: string;
	totalCost: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalTokens: number;
	modelsUsed: string[];
	modelBreakdown: ModelBreakdown[];
	versions: string[];
}

export interface BlocksUsageData {
	id: string;
	startTime: string;
	endTime: string;
	actualEndTime?: string;
	isActive: boolean;
	isGap?: boolean;
	costUSD: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalTokens: number;
	models: string[];
	usageLimitResetTime?: string;
}

export interface ModelBreakdown {
	model: string;
	costUSD: number;
	tokens: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens?: number;
	cacheReadTokens?: number;
}

export interface ProjectBreakdown {
	projectName: string;
	costUSD: number;
	tokens: number;
	modelBreakdown: ModelBreakdown[];
}

// Query parameters interface
export interface ApiQueryParams {
	mode?: 'auto' | 'calculate' | 'display';
	instances?: boolean;
	from?: string;
	to?: string;
	project?: string[];
	model?: string[];
	sortOrder?: 'desc' | 'asc';
	active?: boolean;
	recent?: boolean;
	tokenLimit?: number | 'max';
}

// API functions
export const apiService = {
	// Daily usage endpoints
	async getDailyUsage(params?: ApiQueryParams): Promise<ApiResponse<DailyUsageData[]>> {
		const response = await api.get('/daily', { params });
		return response.data;
	},

	async getDailySummary(params?: ApiQueryParams) {
		const response = await api.get('/daily/summary', { params });
		return response.data;
	},

	// Monthly usage endpoints
	async getMonthlyUsage(params?: ApiQueryParams): Promise<ApiResponse<MonthlyUsageData[]>> {
		const response = await api.get('/monthly', { params });
		return response.data;
	},

	async getMonthlySummary(params?: ApiQueryParams) {
		const response = await api.get('/monthly/summary', { params });
		return response.data;
	},

	// Session usage endpoints
	async getSessionUsage(params?: ApiQueryParams): Promise<ApiResponse<SessionUsageData[]>> {
		const response = await api.get('/session', { params });
		return response.data;
	},

	async getSessionSummary(params?: ApiQueryParams) {
		const response = await api.get('/session/summary', { params });
		return response.data;
	},

	// Blocks usage endpoints
	async getBlocksUsage(params?: ApiQueryParams): Promise<ApiResponse<BlocksUsageData[]>> {
		const response = await api.get('/blocks', { params });
		return response.data;
	},

	async getBlocksSummary(params?: ApiQueryParams) {
		const response = await api.get('/blocks/summary', { params });
		return response.data;
	},

	// Live data endpoints
	async getCurrentUsage(params?: ApiQueryParams) {
		const response = await api.get('/live/current', { params });
		return response.data;
	},

	// Health check
	async getHealth() {
		const response = await api.get('/health');
		return response.data;
	},
};

export default apiService;