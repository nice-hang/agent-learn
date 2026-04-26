import "dotenv/config";

import { runCoTAgent } from "./cot/agent.js";
import { callLLM } from "./llm/ark.js";

console.log("Mode: CoT — single-shot reasoning, no tool loop (contrast with npm run start / ReAct)\n");

const result = await runCoTAgent({
  task: "请先计算 12+30 和 7+9，再对两次计算结果做简短总结，最后给出最终答案说明总和与结论。",
  callLLM,
});

console.log(JSON.stringify(result, null, 2));
