import { buildPrompt } from "./prompt.js";
import { parseReActBlock } from "./parse.js";
import type { AgentResult, Tool } from "./types.js";

export type RunOptions = {
  task: string;
  tools: Tool[];
  maxSteps: number;
  callLLM: (prompt: string) => Promise<string>;
};

function appendStep(
  scratchpad: string,
  thought: string,
  action: string,
  actionInput: string,
  observation: string,
) {
  const block = `思考：${thought}\n行动：${action}\n行动输入：${actionInput}\n观察：${observation}`;
  return scratchpad.trim() ? `${scratchpad.trim()}\n\n${block}` : block;
}

/** ReAct 主循环：思考 → 行动 → 观察，直到结束或步数上限 */
export async function runReActAgent(options: RunOptions): Promise<AgentResult> {
  const { task, tools, maxSteps, callLLM } = options;
  let scratchpad = "";
  const byName = new Map(tools.map((t) => [t.name, t]));

  for (let step = 1; step <= maxSteps; step++) {
    const parsed = parseReActBlock(await callLLM(buildPrompt(task, tools, scratchpad)));
    if (!parsed) {
      return {
        ok: false,
        reason: "parse_error",
        detail: "无法解析为「思考/行动/行动输入」",
        steps: step,
      };
    }
    const { thought, action, actionInput } = parsed;
    if (action === "结束" || action.toLowerCase() === "finish") {
      return { ok: true, answer: actionInput, steps: step };
    }
    const tool = byName.get(action);
    const observation = tool
      ? await tool.execute(actionInput)
      : `未知行动「${action}」，可选：${[...byName.keys()].join("、")}`;
    scratchpad = appendStep(scratchpad, thought, action, actionInput, observation);
  }
  return { ok: false, reason: "max_steps", steps: maxSteps };
}
