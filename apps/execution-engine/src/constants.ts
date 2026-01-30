import { tool } from "ai";
import z from "zod";

export const tools = {
  sum: tool({
    description: "this sum function adds two numbers",
    inputSchema: z.object({
      a: z.number().describe("the first number to add"),
      b: z.number().describe("the second number to add"),
    }),
    execute: async (input: { a: number; b: number }) => {
      return input.a + input.b;
    },
  }),
  multiply: tool({
    description: "this multiply function multiplies two numbers",
    inputSchema: z.object({
      a: z.number().describe("the first number to multiply"),
      b: z.number().describe("the second number to multiply"),
    }),
    execute: async (input: { a: number; b: number }) => {
      return input.a * input.b;
    },
  }),
};
