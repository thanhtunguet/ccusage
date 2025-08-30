import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import apiService, { type ApiQueryParams } from '../services/api';

export interface UseApiDataOptions<T> {
	initialData?: T;
	autoFetch?: boolean;
	onError?: (error: Error) => void;
}

export function useApiData<T>(
	fetchFunction: (params?: ApiQueryParams) => Promise<T>,
	options: UseApiDataOptions<T> = {}
) {
	const { initialData, autoFetch = true, onError } = options;
	
	const [data, setData] = useState<T | undefined>(initialData);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = useCallback(async (params?: ApiQueryParams) => {
		setLoading(true);
		setError(null);
		
		try {
			const result = await fetchFunction(params);
			setData(result);
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Unknown error occurred');
			setError(error);
			
			if (onError) {
				onError(error);
			} else {
				message.error(`Failed to load data: ${error.message}`);
			}
		} finally {
			setLoading(false);
		}
	}, [fetchFunction, onError]);

	const refetch = useCallback((params?: ApiQueryParams) => {
		return fetchData(params);
	}, [fetchData]);

	useEffect(() => {
		if (autoFetch) {
			fetchData();
		}
	}, [autoFetch, fetchData]);

	return {
		data,
		loading,
		error,
		refetch,
	};
}

// Specific hooks for different data types
export function useDailyUsage(params?: ApiQueryParams) {
	return useApiData(apiService.getDailyUsage, { autoFetch: false });
}

export function useMonthlyUsage(params?: ApiQueryParams) {
	return useApiData(apiService.getMonthlyUsage, { autoFetch: false });
}

export function useSessionUsage(params?: ApiQueryParams) {
	return useApiData(apiService.getSessionUsage, { autoFetch: false });
}

export function useBlocksUsage(params?: ApiQueryParams) {
	return useApiData(apiService.getBlocksUsage, { autoFetch: false });
}

export function useDailySummary(params?: ApiQueryParams) {
	return useApiData(apiService.getDailySummary, { autoFetch: false });
}

export function useMonthlySummary(params?: ApiQueryParams) {
	return useApiData(apiService.getMonthlySummary, { autoFetch: false });
}

export function useSessionSummary(params?: ApiQueryParams) {
	return useApiData(apiService.getSessionSummary, { autoFetch: false });
}

export function useBlocksSummary(params?: ApiQueryParams) {
	return useApiData(apiService.getBlocksSummary, { autoFetch: false });
}