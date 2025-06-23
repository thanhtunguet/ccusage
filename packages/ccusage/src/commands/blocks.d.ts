export declare const blocksCommand: import("gunshi").Command<{
    since: {
        readonly type: "custom";
        readonly short: "s";
        readonly description: "Filter from date (YYYYMMDD format)";
        readonly parse: (value: string) => string;
    };
    until: {
        readonly type: "custom";
        readonly short: "u";
        readonly description: "Filter until date (YYYYMMDD format)";
        readonly parse: (value: string) => string;
    };
    json: {
        readonly type: "boolean";
        readonly short: "j";
        readonly description: "Output in JSON format";
        readonly default: false;
    };
    mode: {
        readonly type: "enum";
        readonly short: "m";
        readonly description: "Cost calculation mode: auto (use costUSD if exists, otherwise calculate), calculate (always calculate), display (always use costUSD)";
        readonly default: CostMode;
        readonly choices: any;
    };
    debug: {
        readonly type: "boolean";
        readonly short: "d";
        readonly description: "Show pricing mismatch information for debugging";
        readonly default: false;
    };
    debugSamples: {
        readonly type: "number";
        readonly description: "Number of sample discrepancies to show in debug output (default: 5)";
        readonly default: 5;
    };
    order: {
        readonly type: "enum";
        readonly short: "o";
        readonly description: "Sort order: desc (newest first) or asc (oldest first)";
        readonly default: SortOrder;
        readonly choices: any;
    };
    breakdown: {
        readonly type: "boolean";
        readonly short: "b";
        readonly description: "Show per-model cost breakdown";
        readonly default: false;
    };
    offline: {
        readonly type: "boolean";
        readonly negatable: true;
        readonly short: "O";
        readonly description: "Use cached pricing data for Claude models instead of fetching from API";
        readonly default: false;
    };
    active: {
        type: "boolean";
        short: string;
        description: string;
        default: false;
    };
    recent: {
        type: "boolean";
        short: string;
        description: string;
        default: false;
    };
    tokenLimit: {
        type: "string";
        short: string;
        description: string;
    };
    sessionLength: {
        type: "number";
        short: string;
        description: string;
        default: any;
    };
    live: {
        type: "boolean";
        description: string;
        default: false;
    };
    refreshInterval: {
        type: "number";
        description: string;
        default: any;
    };
}>;
