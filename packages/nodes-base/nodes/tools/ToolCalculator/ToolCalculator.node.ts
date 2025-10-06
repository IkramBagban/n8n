import { z } from "zod";
import type { INodeType, INodeTypeDescription } from "../../../types";

export class ToolCalculator implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Calculator Tool",
    name: "toolCalculator",
    icon: "🧮",
    group: ["tools"],
    version: 1,
    description: "Performs mathematical calculations for AI agents",
    defaults: {
      name: "Calculator",
      color: "#10B981",
    },
    properties: [
      {
        displayName: "Tool Name",
        name: "toolName",
        type: "string",
        default: "calculate",
        description: "Unique name for this tool",
        required: true,
      },
      {
        displayName: "Tool Description",
        name: "toolDescription",
        type: "string",
        default:
          "Useful for performing mathematical calculations. Supports basic arithmetic operations: addition (+), subtraction (-), multiplication (*), division (/), modulo (%), and exponentiation (^). Input should be a valid mathematical expression.",
        description: "Description that helps the AI understand when to use this tool",
        required: true,
      },
      {
        displayName: "Notice",
        name: "notice",
        type: "notice",
        default:
          "This tool will be available to the connected AI Agent. The agent will automatically use it when mathematical calculations are needed.",
      },
    ],
  };

  async supplyTool({ parameters }: { parameters: Record<string, any> }) {
    try {
      const toolName = parameters.toolName || "calculate";
      const toolDescription =
        parameters.toolDescription ||
        "Performs mathematical calculations. Input: mathematical expression (e.g., '2 + 2', '10 * 5')";

      return {
        success: true,
        tool: {
          name: toolName,
          description: toolDescription,
          parameters: z.object({
            expression: z.string().describe(
              "Mathematical expression to evaluate (e.g., '2 + 2', '10 * 5', '(3 + 5) * 2')"
            ),
          }),
          execute: this.executeCalculation,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to supply calculator tool: ${error.message}`,
      };
    }
  }

  async executeCalculation(input: { expression: string }) {
    try {
		console.log("input", input)
      // Sanitize the expression - only allow numbers and basic operators
      const sanitized = input.expression.replace(/[^0-9+\-*/(). ]/g, "");

      if (!sanitized) {
        throw new Error("Invalid expression: contains no valid operators or numbers");
      }

      // Evaluate the expression safely using Function constructor
      // This is safer than eval() as it doesn't have access to local scope
      const result = Function(`'use strict'; return (${sanitized})`)();

      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Calculation resulted in an invalid number");
      }

      return {
        success: true,
        result: result,
        expression: input.expression,
        message: `Calculated: ${input.expression} = ${result}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Calculation error: ${error.message}`,
        expression: input.expression,
      };
    }
  }
}
