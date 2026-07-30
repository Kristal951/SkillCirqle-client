import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export const getFreshSignedUrl = async (
  filePath: string,
  bucket: string = "chat-uploads",
  expiresInSeconds: number = 60 * 60 * 24 * 7,
): Promise<string> => {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;

  return data.signedUrl;
};
