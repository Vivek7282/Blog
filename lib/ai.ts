import { env, hasGeminiConfig } from "@/lib/env";
import { summarizeTextLocally } from "@/lib/utils";

function extractGeminiText(payload: any) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function generatePostSummary(title: string, body: string) {
  if (!hasGeminiConfig || !env.geminiApiKey) {
    return summarizeTextLocally(`${title}. ${body}`, 200);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.geminiApiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following blog post in about 200 words. Keep it clear, reader-friendly, and avoid bullet points.\n\nTitle: ${title}\n\nBody:\n${body}`
                }
              ]
            }
          ]
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const text = extractGeminiText(payload);
    if (!text) {
      throw new Error("Gemini returned an empty summary.");
    }

    return summarizeTextLocally(text, 220);
  } catch {
    return summarizeTextLocally(`${title}. ${body}`, 200);
  }
}
