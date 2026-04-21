import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 🚨 No session
  if (!session) {
    if (
      pathname.startsWith("/client") ||
      pathname.startsWith("/runner") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  const role = session.user.user_metadata?.role;
  const status = session.user.user_metadata?.status;
  const trustScore = session.user.user_metadata?.trust_score ?? 100;

  if (!role) {
    return NextResponse.redirect(new URL("/select-role", req.url));
  }

  const isSuspended = status === "suspended";
  const isFlagged = status === "flagged";
  const isAdmin = role === "admin";
  const isLowTrust = trustScore < 40;

  // 🚨 Suspended
  if (isSuspended) {
    const response = NextResponse.redirect(new URL("/suspended", req.url));

    response.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", { maxAge: 0 });
      }
    });

    return response;
  }

  // 🔐 Admin protection
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ⚠️ Flagged
  if (isFlagged && pathname.startsWith("/runner")) {
    return NextResponse.redirect(new URL("/review", req.url));
  }

  // 🧠 Low trust
  if (isLowTrust && pathname.startsWith("/runner")) {
    return NextResponse.redirect(new URL("/trust-warning", req.url));
  }

  // 🔐 Role enforcement
  if (pathname.startsWith("/client") && role !== "client") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  if (pathname.startsWith("/runner") && role !== "runner") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  if (pathname === "/select-role") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/client/:path*",
    "/runner/:path*",
    "/admin/:path*",
    "/select-role",
  ],
};