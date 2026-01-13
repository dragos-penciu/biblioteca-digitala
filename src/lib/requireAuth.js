import { verifyToken } from "@/lib/auth";

export function getAuthPayload(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  try {
    return verifyToken(auth.slice(7));
  } catch {
    return null;
  }
}
