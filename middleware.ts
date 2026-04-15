import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const protectedRoutes = ["/client", "/runner"];

  const isProtected = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb-refresh-token");

  if (!hasSession) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}