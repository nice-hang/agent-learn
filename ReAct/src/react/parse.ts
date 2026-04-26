export type ParsedAction = {
  type: "action";
  thought: string;
  action: string;
  actionInput: string;
};

export type ParsedFinish = {
  type: "finish";
  thought: string;
  answer: string;
};

export type ParsedBlock = ParsedAction | ParsedFinish;

export type ReasoningLabel = "Thought" | "Reasoning";

export type ParseStructuredOptions = {
  reasoningLabel: ReasoningLabel;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 解析 Thought/Reasoning + Action 或 Final Answer（二选一）。 */
export function parseStructuredBlock(raw: string, options: ParseStructuredOptions): ParsedBlock | null {
  const text = raw.trim();
  const label = escapeRegex(options.reasoningLabel);
  const thoughtMatch = new RegExp(
    `${label}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(Action|Final Answer)\\s*:|$)`,
    "i"
  ).exec(text);
  const thought = thoughtMatch?.[1]?.trim() ?? "";

  const actionMatch = /Action\s*:\s*([^\n]+)\n\s*Action Input\s*:\s*([\s\S]*)$/i.exec(text);
  const finalMatch = /Final Answer\s*:\s*([\s\S]*)$/i.exec(text);

  if (actionMatch && finalMatch) return null;

  if (actionMatch) {
    const action = actionMatch[1].trim();
    const actionInput = actionMatch[2].trim().replace(/^"|"$/g, "");
    if (!action) return null;
    return { type: "action", thought, action, actionInput };
  }

  if (finalMatch) {
    return {
      type: "finish",
      thought,
      answer: finalMatch[1].trim(),
    };
  }

  return null;
}

/** 解析 ReAct 输出：Thought + Action 或 Final Answer。 */
export function parseReActBlock(raw: string): ParsedBlock | null {
  return parseStructuredBlock(raw, { reasoningLabel: "Thought" });
}
