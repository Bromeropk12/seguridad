import { NextResponse } from "next/server";
import crypto from "crypto";

export function validateCsrf(request: Request): boolean {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/csrf_token=([^;]+)/);
  const cookieToken = match ? match[1] : null;
  if (!headerToken || !cookieToken) return false;
  
  const headerBuffer = Buffer.from(headerToken, "utf8");
  const cookieBuffer = Buffer.from(cookieToken, "utf8");
  
  if (headerBuffer.length !== cookieBuffer.length) return false;
  
  return crypto.timingSafeEqual(headerBuffer, cookieBuffer);
}

export function csrfError() {
  return NextResponse.json({ error: "CSRF token invalido" }, { status: 403 });
}
