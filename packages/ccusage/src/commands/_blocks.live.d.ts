/**
 * @fileoverview Live monitoring command orchestration
 *
 * This module provides the command-line interface for live monitoring,
 * handling process lifecycle, signal management, and terminal setup.
 * The actual rendering logic is handled by the _live-rendering module.
 */
import type { LiveMonitoringConfig } from '../_live-rendering.ts';
export declare function startLiveMonitoring(config: LiveMonitoringConfig): Promise<void>;
