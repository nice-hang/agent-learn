/** 从 Ark Chat Completions 响应里取出 assistant 文本 */
function extractChatCompletionText(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("Ark 响应不是 JSON 对象");
  }
  const o = data as Record<string, unknown>;
  const choices = o.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("无法从 Ark 响应中解析 choices");
  }
  const first = choices[0] as Record<string, unknown>;
  const message = first.message as Record<string, unknown> | undefined;
  if (!message) {
    throw new Error("无法从 Ark 响应中解析 message");
  }
  const content = message.content;
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;
      if (b.type === "text" && typeof b.text === "string") {
        parts.push(b.text);
      }
    }
    if (parts.length > 0) return parts.join("");
  }

  throw new Error("无法从 Ark 响应中解析 assistant content，请检查接口返回结构");
}

/**
 * 调用火山方舟 Chat Completions API（与多模态示例一致，纯文本：仅 text 段，无图片）。
 * 需在 `.env` 中设置：`ARK_API_KEY`、`ARK_API_BASE`、`ARK_MODEL`（无代码内默认值）。
 */
export async function callLLM(prompt: string): Promise<string> {
  const key = process.env.ARK_API_KEY;
  if (!key?.trim()) {
    throw new Error("请设置环境变量 ARK_API_KEY（勿把密钥写进代码仓库）");
  }

  const baseRaw = process.env.ARK_API_BASE?.trim();
  if (!baseRaw) {
    throw new Error("请设置环境变量 ARK_API_BASE（例如 https://ark.cn-beijing.volces.com/api/v3）");
  }
  const base = baseRaw.replace(/\/$/, "");
  const url = `${base}/chat/completions`;

  const model = process.env.ARK_MODEL?.trim();
  if (!model) {
    throw new Error("请设置环境变量 ARK_MODEL（模型名或方舟 endpoint id）");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Ark API ${res.status}: ${raw}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`Ark 返回非 JSON：${raw.slice(0, 200)}`);
  }

  return extractChatCompletionText(data);
}
