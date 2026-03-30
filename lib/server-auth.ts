import { NextRequest } from "next/server";
import { adminAuth, adminDB } from "./firebaseAdmin";

export const getServerUser = async (req: NextRequest) => {
  const session = req.cookies.get("session")?.value;

  if (!session) {
    return null; 
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded;
  } catch {
    return null;
  }
};

export const getSessionUser = async (req: NextRequest) => {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    const userRef = adminDB.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) return null;

    return {
      uid: decoded.uid,
      email: decoded.email,
      profile: userSnap.data(),
    };
  } catch {
    return null;
  }
};
