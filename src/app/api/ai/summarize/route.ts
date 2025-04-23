import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, model = "llama3-70b-8192", length = "medium", tone = "neutral" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    let max_tokens = 512;
    if (length === "short") max_tokens = 256;
    else if (length === "detailed") max_tokens = 1536;

    let toneInstruction = "";
    if (tone === "formal") toneInstruction = " Use a formal tone.";
    else if (tone === "casual") toneInstruction = " Use a casual, conversational tone.";
    else if (tone === "technical") toneInstruction = " Use technical language and precise terminology.";
    else if (tone === "simple") toneInstruction = " Use simple, easy-to-understand language.";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            `You are a helpful assistant that summarizes text content. Provide concise but comprehensive summaries that capture the main points and key details.${toneInstruction}`,
        },
        {
          role: "user",
          content: `Please summarize the following text in a ${length} length and ${tone} tone:\n\n${text}`,
        },
      ],
      model,
      temperature: 0.5,
      max_tokens,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in POST /api/summarize:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
} 