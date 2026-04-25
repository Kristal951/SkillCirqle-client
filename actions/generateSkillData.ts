"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Groq from "groq-sdk";
import OpenAI from "openai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateSkillAssets(skillId: string, skillTitle: string) {
  try {
    // ---------------------------
    // STEP 1: BRAIN (Groq)
    // ---------------------------
    const brainResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast + cheap
      messages: [
        {
          role: "user",
          content: `Visual Director Mode. Skill: "${skillTitle}".
Return STRICT JSON:
{ "description": "1-sentence", "style": "Glassmorphism" }`,
        },
      ],
      temperature: 0.7,
    });

    let brainData;

    try {
      brainData = JSON.parse(
        brainResponse.choices[0]?.message?.content || "{}",
      );
    } catch {
      brainData = {
        description: `${skillTitle} skill`,
        style: "Glassmorphism",
      };
    }

    // ---------------------------
    // STEP 2: ARTIST (OpenAI)
    // ---------------------------
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `A professional 3D asset for: "${skillTitle}".
Style: ${brainData.style}. Clean, minimal, pure white background, centered, 1:1 ratio.`,
      size: "1024x1024",
    });

    if (!imageResponse?.data?.length) {
      throw new Error("No image data returned from API");
    }

    const base64Data = imageResponse.data[0].b64_json;

    if (!base64Data) {
      throw new Error("Missing b64_json in image response");
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    // ---------------------------
    // STEP 3: STORAGE (Supabase)
    // ---------------------------
    const filePath = `skills/${skillId}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("skill-assets")
      .upload(filePath, imageBuffer, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("skill-assets").getPublicUrl(filePath);

    // ---------------------------
    // STEP 4: DB UPDATE
    // ---------------------------
    await supabaseAdmin
      .from("skills")
      .update({
        description: brainData.description,
        image_url: publicUrl,
      })
      .eq("id", skillId);

    return { success: true, imageUrl: publicUrl };
  } catch (error: any) {
    console.error("Groq + OpenAI pipeline failed:", error.message);
    return { success: false, error: error.message };
  }
}
