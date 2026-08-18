import { cookies } from "next/headers";

export async function clearStaleAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-")) {
      cookieStore.delete(name);
    }
  });
}