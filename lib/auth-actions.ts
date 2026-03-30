import { adminAuth } from "./firebaseAdmin";

export const logoutUser = async (uid?: string) => {
  if (!uid) return;

  try {
    await adminAuth.revokeRefreshTokens(uid);
  } catch (err) {
    console.error("Error revoking tokens:", err);
  }
};

export const createSession = async (idToken: string) => {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  return { sessionCookie, expiresIn };
};
