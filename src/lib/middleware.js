import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function requireAuth(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("No token provided");

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, JWT_SECRET);
}
