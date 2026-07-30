import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { getFreshSignedUrl } from "./getFreshSignedUrl";

export const uploadFile = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
  bucket: string = "chat-uploads",
  isPrivate: boolean = false,
): Promise<string> => {
  const supabase = getSupabaseBrowserClient();

  const fileExt = file.name.split(".").pop();

  const safeName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `${userId}/${safeName}`;

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress >= 90) clearInterval(interval);
    onProgress?.(progress);
  }, 80);

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  clearInterval(interval);

  if (error) throw error;

  onProgress?.(100);

  if (isPrivate) {
    const url = await getFreshSignedUrl(filePath, bucket);
    return url
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
};
