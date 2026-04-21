import type { Tool } from "./types.js";

/** 用中文说明格式，拼接任务、工具表与草稿 */
export function buildPrompt(task: string, tools: Tool[], scratchpad: string): string {
  const list = tools.map((t) => `- ${t.name}：${t.description}`).join("\n");
  const pad = scratchpad.trim() || "（尚无，请开始。）";
  return `你是推理智能体，用工具完成任务。只输出一块，格式如下（不要用 markdown 代码块）：

思考：……
行动：工具名 或 结束
行动输入：工具参数；若行动是「结束」，此处写最终答案

规则：只能用下列工具名；任务完成时行动填「结束」，答案写在行动输入里。

可用工具：
${list}

任务：
${task}

草稿（思考/行动/观察）：
${pad}

请只输出下一轮：思考、行动、行动输入。`;
}
