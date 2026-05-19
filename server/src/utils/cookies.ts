import { CookieOptions } from "express";

export const authCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 5 * 60 * 60 * 1000,
  };
};
