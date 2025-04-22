import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, model = "llama3-70b-8192" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes text content. Provide concise but comprehensive summaries that capture the main points and key details.",
        },
        {
          role: "user",
          content: `Please summarize the following text:\n\n${text}`,
        },
      ],
      model,
      temperature: 0.5,
      max_tokens: 1024,
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