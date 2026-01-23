import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Remove the data:image/...;base64, prefix if it exists
    const base64Image = image.split(",")[1] || image;

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages: [
        {
          role: "system",
          content: "You are a professional homework solver. Analyze the provided image and give a step-by-step solution. Use bullet points for main sections (e.g., • PROBLEM ANALYSIS, • STEP-BY-STEP SOLUTION, • FINAL ANSWER). Make the FINAL ANSWER bold.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please solve this homework problem from the image." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content;

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to solve the problem" },
      { status: 500 }
    );
  }
}

