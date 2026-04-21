import "dotenv/config";

import { runReActAgent } from "./react/agent.js";
import { callLLM } from "./llm/ark.js";
import type { Tool } from "./react/types.js";

const tools: Tool[] = [
  { name: "回声", description: "原样返回输入文字。", execute: async (s) => s },
  {
    name: "相加",
    description: "两数相加，行动输入形如：2, 3",
    execute: async (s) => {
      const [a, b] = s.split(",").map((x) => Number(x.trim()));
      return String(a + b);
    },
  },
];

const result = await runReActAgent({
  task: "先回声一句问候，再说明已完成。",
  tools,
  maxSteps: 8,
  callLLM,
});

console.log(JSON.stringify(result, null, 2));
