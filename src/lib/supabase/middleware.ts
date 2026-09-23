import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseEnv() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const LOGIN_PATH = "/login";
const LEGACY_ADMIN_LOGIN_PATH = "/admin/login";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLegacyAdminLogin = pathname === LEGACY_ADMIN_LOGIN_PATH;
  const isLogin = pathname === LOGIN_PATH;
  const isAdminLoginApi = pathname === "/api/auth/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isLegacyAdminLogin;
  const isAdminApi =
    (pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/auth/admin")) &&
    !isAdminLoginApi;

  if (isLegacyAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    if (!url.searchParams.get("redirect")) {
      url.searchParams.set("redirect", "/admin");
    }
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      const url = request.nextUrl.clone();
      url.search = "";
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute || isAdminApi) {
    if (!user) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      if (isAdminApi) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const url = request.nextUrl.clone();
      url.pathname = "/gallery";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
