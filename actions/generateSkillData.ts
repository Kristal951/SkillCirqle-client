"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Groq from "groq-sdk";
import { generateImage } from "ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
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
  visualConcept: string;
}> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: ` Visual Director Mode. Skill: "${skillTitle}" Return STRICT JSON only. 
        {
           "description":"one sentence description",
            "visualConcept":"a concrete, literal object or small scene that visually represents this specific skill (e.g. for "Guitar Lessons" → "a sunburst acoustic guitar resting at a slight angle with a pick beside it"; for "Watercolor Painting" → "a wooden palette with dabs of colorful watercolor paint and a wet brush"). Avoid abstract shapes — describe a real, recognizable object tied to this skill."
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
      visualConcept:
        data.visualConcept || `an object representing ${skillTitle}`,
    };
  } catch (err) {
    console.warn("[brain] Failed parsing JSON", err);

    return {
      description: `${skillTitle} skill`,
      visualConcept: `an object representing ${skillTitle}`,
    };
  }
}

async function generateSkillImage(
  skillTitle: string,
  visualConcept: string,
): Promise<Buffer> {
  const prompt = `
A professional 3D rendered icon depicting: ${visualConcept}

This represents the skill "${skillTitle}" — the object(s) should be immediately recognizable and directly tied to this skill, not abstract.

Style:
- Clean 3D render, soft studio lighting
- Centered composition, single focal object or small grouped scene
- Background: soft gradient (muted pastel or cool neutral tones), subtle depth — NOT flat white or pure white
- Soft ambient shadow beneath the object
- Modern, premium, minimal aesthetic
- Square aspect ratio
- No text, no logos, no watermark
- No people, no hands
`.trim();

  const result = await generateImage({
    model: "xai/grok-imagine-image",
    prompt,
    aspectRatio: "1:1",
  });

  const imageData = result.images[0];

  return Buffer.from(imageData.base64, "base64");
}

async function uploadToStorage(
  skillId: string,
  imageBuffer: Buffer,
): Promise<string> {
  const path = `skills/${skillId}.png`;

  const { error } = await supabaseAdmin.storage
    .from("skill-assets")
    .upload(path, imageBuffer, {
      upsert: true,
      contentType: "image/png",
    });

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
    const { description, visualConcept } =
      await generateDescription(skillTitle);

    step = "image-generation";
    const imageBuffer = await generateSkillImage(skillTitle, visualConcept);

    step = "storage";
    const imageUrl = await uploadToStorage(skillId, imageBuffer);

    step = "db-update";
    await updateSkillRecord(skillId, description, imageUrl);

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
