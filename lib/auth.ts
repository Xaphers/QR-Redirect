import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";

function token() {
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSWORD}::qr-redirect`)
    .digest("hex");
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === token();
}

export async function login(password: string) {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  const store = await cookies();
  store.set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE);
}
