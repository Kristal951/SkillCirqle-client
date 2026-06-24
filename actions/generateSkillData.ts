"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

type StepName = "brain" | "image-generation" | "storage" | "db-update";

type Result =
  | {
      success: true;
      imageUrl: string;
    }
  | {
      success: false;
      error: string;
      step: StepName;
    };

function extractJson(raw: string): Record<string, string> {
  const match = raw.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("No JSON object found");
  }

  return JSON.parse(match[0]);
}

async function generateDescription(skillTitle: string): Promise<{
  description: string;
  style: string;
}> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    temperature: 0.7,

    messages: [
      {
        role: "user",

        content: `
Visual Director Mode.

Skill: "${skillTitle}"

Return STRICT JSON only.

{
"description":"one sentence description",
"style":"single visual style"
}
        `,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || "{}";

  try {
    const data = extractJson(raw);

    return {
      description: data.description || `${skillTitle} skill`,

      style: data.style || "Glassmorphism",
    };
  } catch (err) {
    console.warn("[brain] Failed parsing JSON", err);

    return {
      description: `${skillTitle} skill`,
      style: "Glassmorphism",
    };
  }
}

async function generateImage(
  skillTitle: string,
  style: string,
): Promise<Buffer> {
  const prompt = `
Professional 3D asset representing "${skillTitle}"

Style:
${style}

Requirements:

- Modern
- Premium
- Minimal
- Centered object
- White background
- Soft shadows
- High quality render
- Square aspect ratio
- No text
- No watermark
`;

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash-image-preview",

    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts;

  if (!parts) {
    throw new Error("Gemini returned no content");
  }

  const imagePart = parts.find((part) =>
    part.inlineData?.mimeType?.startsWith("image/"),
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini returned no image");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function uploadToStorage(
  skillId: string,
  imageBuffer: Buffer,
): Promise<string> {
  const path = `skills/${skillId}.png`;

  const { error } = await supabaseAdmin.storage
    .from("skill-assets")

    .upload(
      path,
      imageBuffer,

      {
        upsert: true,
        contentType: "image/png",
      },
    );

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("skill-assets").getPublicUrl(path);

  return publicUrl;
}

async function updateSkillRecord(
  skillId: string,

  description: string,

  imageUrl: string,
): Promise<void> {
  const { error } = await supabaseAdmin

    .from("skills")

    .update({
      description,

      image_url: imageUrl,
    })

    .eq("id", skillId);

  if (error) {
    throw error;
  }
}

export async function generateSkillAssets(
  skillId: string,

  skillTitle: string,
): Promise<Result> {
  let step: StepName = "brain";

  try {
    // Step 1
    const { description, style } = await generateDescription(skillTitle);

    // Step 2
    step = "image-generation";

    const imageBuffer = await generateImage(
      skillTitle,

      style,
    );

    // Step 3
    step = "storage";

    const imageUrl = await uploadToStorage(
      skillId,

      imageBuffer,
    );

    // Step 4
    step = "db-update";

    await updateSkillRecord(
      skillId,

      description,

      imageUrl,
    );

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`[generateSkillAssets] ${step}`, message);

    return {
      success: false,
      error: message,
      step,
    };
  }
}
