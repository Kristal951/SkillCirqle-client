import { jwtDecode } from "jwt-decode"; 

interface SupabaseAccessTokenClaims {
  sub: string;         
  session_id: string; 
  exp: number;
  [key: string]: unknown;
}

export function getSessionIdFromAccessToken(accessToken: string): string | null {
  try {
    const claims = jwtDecode<SupabaseAccessTokenClaims>(accessToken);
    return claims.session_id ?? null;
  } catch (err) {
    console.error("Failed to decode access token claims:", err);
    return null;
  }
}