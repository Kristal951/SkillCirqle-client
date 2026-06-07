"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Groq from "groq-sdk";
import OpenAI from "openai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type StepName = "brain" | "image-generation" | "storage" | "db-update";

type Result =
  | { success: true; imageUrl: string }
  | { success: false; error: string; step: StepName };

function extractJson(raw: string): Record<string, string> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");
  return JSON.parse(match[0]);
}

async function generateDescription(
  skillTitle: string,
): Promise<{ description: string; style: string }> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `Visual Director Mode. Skill: "${skillTitle}".
Return STRICT JSON only, no extra text:
{ "description": "1-sentence description of the skill", "style": "one visual art style (e.g. Glassmorphism, Flat Design, Isometric)" }`,
      },
    ],
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content || "{}";

  try {
    const data = extractJson(raw);
    return {
      description: data.description || `${skillTitle} skill`,
      style: data.style || "Glassmorphism",
    };
  } catch (err) {
    console.warn("[brain] JSON parse failed, using fallback.", err);
    return { description: `${skillTitle} skill`, style: "Glassmorphism" };
  }
}

// async function generateImage(
//   skillTitle: string,
//   style: string,
// ): Promise<Buffer> {
//   const imageResponse = await openai.images.generate({
//     model: "gpt-image-1",
//     prompt: `A professional 3D asset for: "${skillTitle}". Style: ${style}. Clean, minimal, pure white background, centered, 1:1 ratio.`,
//     size: "1024x1024",
//     response_format: "b64_json",
//   });

//   if (!imageResponse?.data?.length) {
//     throw new Error("No image data returned from API");
//   }

//   const b64 = imageResponse.data[0].b64_json;
//   if (!b64) throw new Error("Missing b64_json in image response");

//   return Buffer.from(b64, "base64");
// }

async function generateImage(
  skillTitle: string,
  style: string,
): Promise<Buffer> {
  const prompt = `A professional 3D asset for: "${skillTitle}". Style: ${style}. Clean, minimal, pure white background, centered, 1:1 ratio.`;

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Pollinations request failed: ${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToStorage(
  skillId: string,
  imageBuffer: Buffer,
): Promise<string> {
  const filePath = `skills/${skillId}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("skill-assets")
    .upload(filePath, imageBuffer, { upsert: true, contentType: "image/png" });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("skill-assets").getPublicUrl(filePath);

  return publicUrl;
}

async function updateSkillRecord(
  skillId: string,
  description: string,
  imageUrl: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("skills")
    .update({ description, image_url: imageUrl })
    .eq("id", skillId);

  if (error) throw error;
}

export async function generateSkillAssets(
  skillId: string,
  skillTitle: string,
): Promise<Result> {
  let step: StepName = "brain";

  try {
    const { description, style } = await generateDescription(skillTitle);

    step = "image-generation";
    const imageBuffer = await generateImage(skillTitle, style);

    step = "storage";
    const imageUrl = await uploadToStorage(skillId, imageBuffer);

    step = "db-update";
    await updateSkillRecord(skillId, description, imageUrl);

    return { success: true, imageUrl };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[generateSkillAssets] Step "${step}" failed:`, message);
    return { success: false, error: message, step };
  }
}
