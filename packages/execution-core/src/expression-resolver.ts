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
    const expressionRegex = /\{\{\s*([^}]+)\s*\}\}/g;

    const singleExpressionMatch = str.match(/^\{\{\s*([^}]+)\s*\}\}$/);
    if (singleExpressionMatch && singleExpressionMatch[1]) {
      return this.resolveExpression(singleExpressionMatch[1].trim());
    }

    return str.replace(expressionRegex, (_match, expression) => {
      const resolved = this.resolveExpression(expression.trim());
      return String(resolved ?? "");
    });
  }

  private resolveExpression(expression: string): unknown {
    try {
      const parts = expression.split(".");

      if (parts.length < 2) {
        console.warn(`Invalid expression format: ${expression}`);
        return null;
      }

      const nodeId = parts[0] ?? "";
      const path = parts.slice(1);
      const nodeData = nodeId ? this.nodeOutputs[nodeId] : undefined;

      if (!nodeData) {
        console.warn(`Node data not found for: ${nodeId}`);
        return null;
      }

      let current: any = nodeData;
      for (const key of path) {
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

  resolveParameters(
    parameters: Record<string, unknown>
  ): Record<string, unknown> {
    return this.resolve(parameters) as Record<string, unknown>;
  }
}
