export type ParsedBlock = { thought: string; action: string; actionInput: string };

/** 解析模型输出里的「思考/行动/行动输入」（协议仍为中文标签） */
export function parseReActBlock(raw: string): ParsedBlock | null {
  const text = raw.trim();
  const thoughtMatch = /思考[：:]\s*([\s\S]*?)(?=\n\s*行动[：:])/i.exec(text);
  const afterThought = thoughtMatch ? text.slice(thoughtMatch.index + thoughtMatch[0].length) : text;
  const actionMatch = /行动[：:]\s*([^\n]+)/i.exec(afterThought);
  const inputMatch = /行动输入[：:]\s*([\s\S]*?)$/i.exec(text);
  if (!actionMatch || !inputMatch || !actionMatch[1].trim()) return null;
  return {
    thought: thoughtMatch ? thoughtMatch[1].trim() : "",
    action: actionMatch[1].trim(),
    actionInput: inputMatch[1].trim(),
  };
}
