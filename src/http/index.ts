/**
 * @fileoverview HTTP module with proxy support and factory functions
 *
 * This module provides a unified interface for HTTP operations with
 * automatic proxy detection and graceful fallback to direct connections.
 *
 * @module http
 */

import type { HttpClient } from './client.ts';
import { ProxyAwareHttpClient } from './proxy-aware-client.ts';

/**
 * Creates a new HTTP client that automatically uses proxy settings from environment variables if available.
 *
 * Returns a client that supports HTTP operations with built-in proxy detection and fallback to direct connections when no proxy is configured.
 *
 * @returns An HTTP client instance with automatic proxy support
 */
export function createHttpClient(): HttpClient {
	return new ProxyAwareHttpClient();
}

/**
 * Default HTTP client instance
 *
 * This is a singleton instance that can be used throughout the application
 * for HTTP operations with automatic proxy support.
 */
export const httpClient = createHttpClient();

// Re-export types for convenience
export type { HttpClient, ProxyConfig } from './client.ts';
export { ProxyAwareHttpClient } from './proxy-aware-client.ts';
