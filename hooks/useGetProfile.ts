export const getUserProfile = async () => {
  const res = await fetch("/api/auth/profile", {
    method: "GET",
    credentials: "include", // 🔥 THIS IS THE FIX
  });
  const data = await res.json();

  return data;
};
