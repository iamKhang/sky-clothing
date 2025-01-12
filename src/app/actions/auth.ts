"use server";

import { cookies } from "next/headers";

export async function setCookies(token: string, fullName: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 1 day
  });

  cookieStore.set("fullName", fullName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60,
  });
}

export async function getCookies() {
  const cookieStore = await cookies();
  return {
    token: cookieStore.get("token")?.value,
    fullName: cookieStore.get("fullName")?.value,
  };
}

export async function clearCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("fullName");
}
