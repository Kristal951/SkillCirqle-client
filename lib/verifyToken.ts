import { adminAuth } from "./firebaseAdmin";

export const verifyToken = async (token: string) => {
  return await adminAuth.verifyIdToken(token);
};