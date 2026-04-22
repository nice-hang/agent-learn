import { buildPrompt } from "./prompt.js";
import { parseReActBlock } from "./parse.js";
import type { AgentResult, Tool } from "./types.js";

export type RunOptions = {
  task: string;
  tools: Tool[];
  maxSteps: number;
  callLLM: (prompt: string) => Promise<string>;
};

function printRoundHeader(step: number, maxSteps: number) {
  console.log(`\n========== ReAct Round ${step}/${maxSteps} ==========`); 
}

function printKeyValue(label: string, value: string) {
  console.log(`${label.padEnd(12, " ")}${value || "(empty)"}`);
}

function appendStep(
  scratchpad: string,
  thought: string,
  action: string,
  actionInput: string,
  observation: string,
) {
  const block = `Thought: ${thought}\nAction: ${action}\nAction Input: ${actionInput}\nObservation: ${observation}`;
  return scratchpad.trim() ? `${scratchpad.trim()}\n\n${block}` : block;
}

/** ReAct 主循环：思考 → 行动 → 观察，直到结束或步数上限 */
export async function runReActAgent(options: RunOptions): Promise<AgentResult> {
  const { task, tools, maxSteps, callLLM } = options;
  let scratchpad = "";
  const byName = new Map(tools.map((t) => [t.name, t]));

  for (let step = 1; step <= maxSteps; step++) {
    printRoundHeader(step, maxSteps);
    const parsed = parseReActBlock(await callLLM(buildPrompt(task, tools, scratchpad)));
    if (!parsed) {
      printKeyValue("Parse Error:", "无法匹配 ReAct 协议输出");
      return {
        ok: false,
        reason: "parse_error",
        detail: "LLM output must be either Action+Action Input or Final Answer",
        steps: step,
      };
    }

    if (parsed.type === "finish") {
      printKeyValue("Thought:", parsed.thought);
      printKeyValue("Final Answer:", parsed.answer);
      return { ok: true, answer: parsed.answer, steps: step };
    }

    const { thought, action, actionInput } = parsed;
    printKeyValue("Thought:", thought);
    printKeyValue("Action:", action);
    printKeyValue("Action Input:", actionInput);
    const tool = byName.get(action);
    const observation = tool
      ? await tool.execute(actionInput)
      : `Unknown action "${action}". Available tools: ${[...byName.keys()].join(", ")}`;
    printKeyValue("Observation:", observation);
    scratchpad = appendStep(scratchpad, thought, action, actionInput, observation);
  }
  console.log(`\n========== ReAct Exit: max_steps(${maxSteps}) ==========`); 
  return { ok: false, reason: "max_steps", steps: maxSteps };
}
