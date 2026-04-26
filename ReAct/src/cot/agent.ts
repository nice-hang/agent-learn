import { buildCoTPrompt } from "./prompt.js";
import { parseStructuredBlock } from "../react/parse.js";
import type { AgentResult } from "../react/types.js";

export type RunCoTOptions = {
  task: string;
  callLLM: (prompt: string) => Promise<string>;
};

function printKeyValue(label: string, value: string) {
  console.log(`${label.padEnd(12, " ")}${value || "(empty)"}`);
}

/**
 * 标准 CoT：单次 LLM 调用，链式推理 + Final Answer。
 * 与 ReAct 的区别：无 Action/Observation 循环、不执行工具。
 */
export async function runCoTAgent(options: RunCoTOptions): Promise<AgentResult> {
  const { task, callLLM } = options;
  console.log("\n========== CoT (single-shot, no tools) ==========");

  const parsed = parseStructuredBlock(await callLLM(buildCoTPrompt(task)), {
    reasoningLabel: "Reasoning",
  });

  if (!parsed) {
    printKeyValue("Parse Error:", "需要 Reasoning: 与 Final Answer:（不要输出 Action）");
    return {
      ok: false,
      reason: "parse_error",
      detail: "Expected Reasoning: ... then Final Answer: ... (CoT does not execute tools)",
      steps: 1,
    };
  }

  if (parsed.type === "action") {
    printKeyValue("Parse Error:", "标准 CoT 不执行工具，不应出现 Action");
    return {
      ok: false,
      reason: "parse_error",
      detail: "CoT mode is single-shot without tool calls; remove Action / Action Input",
      steps: 1,
    };
  }

  printKeyValue("Reasoning:", parsed.thought);
  printKeyValue("Final Answer:", parsed.answer);
  return { ok: true, answer: parsed.answer, steps: 1 };
}
