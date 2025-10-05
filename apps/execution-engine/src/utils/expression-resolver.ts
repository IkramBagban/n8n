interface NodeOutputData {
  [nodeId: string]: {
    json: Record<string, unknown>;
  };
}

export class ExpressionResolver {
  private nodeOutputs: NodeOutputData;

  constructor(nodeOutputs: NodeOutputData) {
    this.nodeOutputs = nodeOutputs;
  }

  /**
   * Resolves expressions like {{ node-123.json.result.text }}
   * @param value - The value that might contain expressions
   * @returns Resolved value with expressions replaced
   */
  resolve(value: unknown): unknown {
    if (typeof value === "string") {
      return this.resolveString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.resolve(item));
    }

    if (value && typeof value === "object") {
      const resolved: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolve(val);
      }
      return resolved;
    }

    return value;
  }

  private resolveString(str: string): unknown {
    // Match {{ expression }} patterns
    const expressionRegex = /\{\{\s*([^}]+)\s*\}\}/g; 

    // Check if the entire string is just one expression
    const singleExpressionMatch = str.match(/^\{\{\s*([^}]+)\s*\}\}$/);
    if (singleExpressionMatch && singleExpressionMatch[1]) {
      // Return the resolved value directly
      return this.resolveExpression(singleExpressionMatch[1].trim());
    }

    // Replace all expressions in the string
    return str.replace(expressionRegex, (match, expression) => {
      const resolved = this.resolveExpression(expression.trim());
      return String(resolved ?? "");
    });
  }

  private resolveExpression(expression: string): unknown {
    try {
      // Split the expression by dots: node-123.json.result.text
      const parts = expression.split(".");

      if (parts.length < 2) {
        console.warn(`Invalid expression format: ${expression}`);
        return null;
      }

      const nodeId = parts[0] ?? ""; // node-123
      const path = parts.slice(1); // ['json', 'result', 'text']

      // Get the node's output data
      const nodeData = nodeId ? this.nodeOutputs[nodeId] : undefined;

      if (!nodeData) {
        console.warn(`Node data not found for: ${nodeId}`);
        return null;
      }

      // Navigate through the path to get the value
      let current: any = nodeData;
      for (const key of path) {
        // Handle array index notation like [0]
        if (key.startsWith("[") && key.endsWith("]")) {
          const index = parseInt(key.slice(1, -1));
          if (Array.isArray(current) && !isNaN(index)) {
            current = current[index];
          } else {
            console.warn(`Invalid array access: ${expression}`);
            return null;
          }
        } else if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          console.warn(`Path not found: ${expression}`);
          return null;
        }
      }

      return current;
    } catch (error) {
      console.error(`Error resolving expression "${expression}":`, error);
      return null;
    }
  }

  /**
   * Resolves all expressions in node parameters
   * @param parameters - Node parameters that might contain expressions
   * @returns Parameters with resolved expressions
   */
  resolveParameters(
    parameters: Record<string, unknown>
  ): Record<string, unknown> {
    return this.resolve(parameters) as Record<string, unknown>;
  }
}
