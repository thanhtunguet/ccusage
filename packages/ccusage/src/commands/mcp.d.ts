/**
 * MCP server command that supports both stdio and HTTP transports.
 * Allows starting an MCP server for external integrations with usage reporting tools.
 */
export declare const mcpCommand: import("gunshi").Command<{
    mode: {
        readonly type: "enum";
        readonly short: "m";
        readonly description: "Cost calculation mode: auto (use costUSD if exists, otherwise calculate), calculate (always calculate), display (always use costUSD)";
        readonly default: CostMode;
        readonly choices: any;
    };
    type: {
        type: "enum";
        short: string;
        description: string;
        choices: ["stdio", "http"];
        default: string;
    };
    port: {
        type: "number";
        description: string;
        default: any;
    };
}>;
