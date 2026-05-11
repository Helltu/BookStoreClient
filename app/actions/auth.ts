"use server";

import { cookies } from "next/headers";

export async function setTokenCookie(token: string) {
  const store = await cookies();
  store.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearTokenCookie() {
  const store = await cookies();
  store.delete("token");
}
