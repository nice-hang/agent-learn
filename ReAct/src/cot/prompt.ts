/** 标准单次 CoT：模型在上下文内逐步推理，不调用外部工具。 */
export function buildCoTPrompt(task: string): string {
  return `You solve tasks using chain-of-thought only: no tools, no external actions—reason inside your answer, then conclude.

Output format (no markdown code fences, English labels required):

Reasoning: step-by-step work (break into short numbered or bulleted steps if helpful)
Final Answer: concise answer that fully addresses the task

Task:
${task}`;
}
