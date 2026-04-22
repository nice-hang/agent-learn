import type { Tool } from "./types.js";

/** 构造最小 ReAct 提示词：只让模型输出一轮 Action 或 Final Answer。 */
export function buildPrompt(task: string, tools: Tool[], scratchpad: string): string {
  const toolNames = tools.map((t) => t.name).join(", ");
  const toolsText = tools.map((t) => `- ${t.name}: ${t.description}`).join("\n");
  const pad = scratchpad.trim() || "(empty)";
  return `You are a ReAct agent. Use tools to solve the task.

Use exactly one of the following two output formats (no markdown code fences):

Format A (continue with a tool):
Thought: your reasoning
Action: one of [${toolNames}]
Action Input: tool input

Format B (finish):
Thought: I now know the final answer
Final Answer: final answer to the original task

Tools:
${toolsText}

Task:
${task}

Scratchpad (previous Thought/Action/Action Input/Observation):
${pad}

Now output only the next step.`;
}
