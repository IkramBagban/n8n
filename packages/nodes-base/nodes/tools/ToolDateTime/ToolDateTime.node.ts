import { z } from "zod";
import type { INodeType, INodeTypeDescription } from "../../../types";

export class ToolDateTime implements INodeType {
  description: INodeTypeDescription = {
    displayName: "DateTime Tool",
    name: "toolDateTime",
    icon: "🕐",
    group: ["tools"],
    version: 1,
    description: "Provides date and time information for AI agents",
    defaults: {
      name: "DateTime",
      color: "#8B5CF6",
    },
    properties: [
      {
        displayName: "Tool Name",
        name: "toolName",
        type: "string",
        default: "get_datetime",
        description: "Unique name for this tool",
        required: true,
      },
      {
        displayName: "Tool Description",
        name: "toolDescription",
        type: "string",
        default:
          "Useful for getting current date and time information, formatting dates, or calculating time differences. Can provide timestamps, formatted dates, and time calculations.",
        description: "Description that helps the AI understand when to use this tool",
        required: true,
      },
      {
        displayName: "Notice",
        name: "notice",
        type: "notice",
        default:
          "This tool will be available to the connected AI Agent. The agent will automatically use it when date/time information is needed.",
      },
    ],
  };

  async supplyTool({ parameters }: { parameters: Record<string, any> }) {
    try {
      const toolName = parameters.toolName || "get_datetime";
      const toolDescription =
        parameters.toolDescription ||
        "Provides current date and time information. Supports operations: 'now', 'format', 'diff'";

      return {
        success: true,
        tool: {
          name: toolName,
          description: toolDescription,
          inputSchema: z.object({
            operation: z
              .enum(["now", "format", "diff"])
              .describe(
                "Operation to perform: 'now' for current time, 'format' to format a date, 'diff' to calculate difference"
              ),
            format: z
              .string()
              .optional()
              .describe("Date format (e.g., 'YYYY-MM-DD', 'HH:mm:ss'). Optional."),
            date1: z
              .string()
              .optional()
              .describe("First date (ISO format). Required for 'format' and 'diff'"),
            date2: z
              .string()
              .optional()
              .describe("Second date (ISO format). Required for 'diff'"),
          }),
          execute: this.executeDateTime,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to supply datetime tool: ${error.message}`,
      };
    }
  }

  async executeDateTime(input: {
    operation: "now" | "format" | "diff";
    format?: string;
    date1?: string;
    date2?: string;
  }) {
    try {
      switch (input.operation) {
        case "now": {
          const now = new Date();
          return {
            success: true,
            result: {
              timestamp: now.getTime(),
              iso: now.toISOString(),
              formatted: input.format
                ? this.formatDate(now, input.format)
                : now.toString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            message: `Current date and time retrieved`,
          };
        }

        case "format": {
          if (!input.date1) {
            throw new Error("date1 is required for format operation");
          }
          const date = new Date(input.date1);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date format for date1");
          }
          return {
            success: true,
            result: {
              formatted: this.formatDate(date, input.format || "YYYY-MM-DD HH:mm:ss"),
              original: input.date1,
            },
            message: `Date formatted successfully`,
          };
        }

        case "diff": {
          if (!input.date1 || !input.date2) {
            throw new Error("Both date1 and date2 are required for diff operation");
          }
          const d1 = new Date(input.date1);
          const d2 = new Date(input.date2);
          if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error("Invalid date format");
          }
          const diffMs = d2.getTime() - d1.getTime();
          return {
            success: true,
            result: {
              milliseconds: diffMs,
              seconds: Math.floor(diffMs / 1000),
              minutes: Math.floor(diffMs / 60000),
              hours: Math.floor(diffMs / 3600000),
              days: Math.floor(diffMs / 86400000),
              humanReadable: this.formatDuration(diffMs),
            },
            message: `Time difference calculated`,
          };
        }

        default:
          throw new Error(`Unknown operation: ${input.operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: `DateTime operation error: ${error.message}`,
      };
    }
  }

  private formatDate(date: Date, format: string): string {
    const map: Record<string, string> = {
      YYYY: date.getFullYear().toString(),
      MM: String(date.getMonth() + 1).padStart(2, "0"),
      DD: String(date.getDate()).padStart(2, "0"),
      HH: String(date.getHours()).padStart(2, "0"),
      mm: String(date.getMinutes()).padStart(2, "0"),
      ss: String(date.getSeconds()).padStart(2, "0"),
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (matched) => map[matched] || matched);
  }

  private formatDuration(ms: number): string {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

    return parts.join(", ") || "0 seconds";
  }
}
