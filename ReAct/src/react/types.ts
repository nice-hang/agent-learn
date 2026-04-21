/** 单个可调用工具 */
export type Tool = {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
};

export type AgentResult =
  | { ok: true; answer: string; steps: number }
  | { ok: false; reason: "max_steps" | "parse_error"; detail?: string; steps: number };
