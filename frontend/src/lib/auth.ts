import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ayush_sih26044_secret_key_2026_super_secure"
);

const SESSION_COOKIE_NAME = "ayush_session_token";

export interface SessionPayload {
  userId?: string;
  sub?: string;
  email: string;
  name?: string;
  role: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";
  profileId?: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const p = payload as any;
    const rawRole = (p.role || "STUDENT").toUpperCase();
    const mappedRole = rawRole === "ACADEMICIAN" ? "FACULTY" : rawRole;

    return {
      userId: p.userId || p.sub,
      email: p.email || "",
      name: p.name || "",
      role: mappedRole as any,
      profileId: p.profileId || p.profile_id || p.userId || p.sub || "profile-default",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function getCurrentUser(): Promise<(SessionPayload & { fullProfile?: any }) | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const userData = await res.json();
        const role = (userData.role === "ACADEMICIAN" ? "FACULTY" : userData.role) as any;
        return {
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          role,
          profileId: userData.profile_id || payload.profileId || userData.id,
          fullProfile: userData,
        };
      }
      // Stale or invalid session: user no longer exists in database
      return null;
    } catch {
      // Backend unreachable or network error
      return null;
    }
  } catch {
    return null;
  }
}
