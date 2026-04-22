"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateSkillAssets(skillId: string, skillTitle: string) {
  try {
    // --- STEP 1: BRAIN (Gemini 3 Flash) ---
    // Handles the reasoning and description logic
    const brainResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: [{
        role: "user",
        parts: [{
          text: `Visual Director Mode. Skill: "${skillTitle}".
          Return STRICT JSON: { "description": "1-sentence", "style": "Glassmorphism" }`
        }]
      }],
      config: { responseMimeType: "application/json" }
    });

    const brainData = JSON.parse(brainResponse.text || "{}");

    // --- STEP 2: ARTIST (Gemini 2.5 Flash Image) ---
    // This is the model that gives you 500 images/day for FREE
    const imageResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash-image", 
      contents: [{
        role: "user",
        parts: [{
          text: `A professional 3D asset for: "${skillTitle}". 
                 Style: ${brainData.style}. Pure white background, 1:1 ratio.`
        }]
      }],
      config: { 
        // Essential: instructs the model to generate binary image data
        responseModalities: ["IMAGE"] 
      }
    });

    // Extract the image binary
    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const base64Data = imagePart?.inlineData?.data;

    if (!base64Data) throw new Error("Free Tier: Image data missing.");

    const imageBuffer = Buffer.from(base64Data, "base64");

    // --- STEP 3: PERSISTENCE (Supabase) ---
    const filePath = `skills/${skillId}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("skill-assets")
      .upload(filePath, imageBuffer, { upsert: true, contentType: "image/png" });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("skill-assets")
      .getPublicUrl(filePath);

    // --- STEP 4: DB UPDATE ---
    await supabaseAdmin
      .from("skills")
      .update({ description: brainData.description, image_url: publicUrl })
      .eq("id", skillId);

    return { success: true, imageUrl: publicUrl };

  } catch (error: any) {
    console.error("Gemini 2026 Pipeline failed:", error.message);
    return { success: false, error: error.message };
  }
}