import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserToDB } from "@/lib/user";
import { signInWithEmailAndPassword } from "firebase/auth";
import { apiFetch } from "./api";

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(res.user, { displayName: name });

  await saveUserToDB(res.user);

  const token = await res.user.getIdToken();

  await apiFetch("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" },
  });

  return res.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);

  const token = await res.user.getIdToken();

  await apiFetch("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" },
  });

  return res.user;
};

export const logout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
};
