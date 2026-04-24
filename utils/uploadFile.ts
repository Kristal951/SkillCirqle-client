import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const uploadFile = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const supabase = getSupabaseBrowserClient();

  const fileExt = file.name.split(".").pop();

  // ✅ safe unique filename
  const safeName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `${userId}/${safeName}`;

  // 🔵 fake smooth progress (Supabase limitation workaround)
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress >= 90) clearInterval(interval);
    onProgress?.(progress);
  }, 80);

  const { error } = await supabase.storage
    .from("chat-uploads")
    .upload(filePath, file);

  clearInterval(interval);

  if (error) throw error;

  onProgress?.(100);

  const { data } = supabase.storage
    .from("chat-uploads")
    .getPublicUrl(filePath);

  return data.publicUrl;
};