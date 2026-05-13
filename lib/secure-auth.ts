import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cyber-lab-secret-key-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: { username: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

const users = new Map<string, { username: string; password: string; role: string }>([
  ["admin", { username: "admin", password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiWYMF0/WqYi", role: "admin" }],
  ["demo", { username: "demo", password: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", role: "user" }],
]);

export async function findSecureUserByUsername(username: string) {
  return users.get(username) || null;
}

export async function createSecureUser(username: string, password: string, role: string = "user") {
  if (users.has(username)) {
    throw new Error("User already exists");
  }
  const hashedPassword = await hashPassword(password);
  users.set(username, { username, password: hashedPassword, role });
  return { username, role };
}