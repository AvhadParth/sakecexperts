import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "sx_session";
const JWT_SECRET = "change-this-in-real-app"; // local-only demo

export function setSession(user) {
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role, dept: user.department }, JWT_SECRET, { expiresIn: "7d" });
  cookies().set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}
