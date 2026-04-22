export const getUserProfile = async () => {
  const res = await fetch("/api/auth/profile", {
    method: "GET",
    credentials: "include", 
  });
  const data = await res.json();
  return data;
};
