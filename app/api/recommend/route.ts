import { NextRequest, NextResponse } from "next/server";
import { getIndexableTools } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI recommendations are not configured on this deployment." },
      { status: 503 },
    );
  }

  let query: string;
  try {
    const body = await req.json() as { query?: string };
    query = (body.query ?? "").trim().slice(0, 500);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "query is required." }, { status: 400 });
  }

  const tools = getIndexableTools().slice(0, 150);
  const toolList = tools
    .map((t) => `${t.name} (slug: ${t.slug}): ${t.shortDescription}`)
    .join("\n");

  const systemPrompt = `You are a tool recommender for Toolbox Hub, a free online tools site with no signup required. Given a user's task description, recommend the best 1-3 tools from the list below.

Return ONLY valid JSON in this exact format with no extra text:
{"recommendations":[{"toolName":"...","slug":"...","reason":"..."}]}

Tool list:
${toolList}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "AI service unavailable." }, { status: 502 });
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    const parsed = JSON.parse(match[0]) as {
      recommendations: { toolName: string; slug: string; reason: string }[];
    };

    const slugSet = new Set(tools.map((t) => t.slug));
    const validated = parsed.recommendations.filter((r) => slugSet.has(r.slug)).slice(0, 3);

    return NextResponse.json({ recommendations: validated });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
