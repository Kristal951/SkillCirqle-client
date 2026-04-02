import { NextResponse } from "next/server";

const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Next.js",
  "Docker",
  "AI",
  "DevOps",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const filtered = SKILLS.filter((skill) =>
    skill.toLowerCase().includes(query)
  );

  return NextResponse.json({ skills: filtered });
}