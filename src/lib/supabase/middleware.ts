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
const GALLERY_PATH = "/gallery";
/** Keep in sync with STUDENT_COOKIE in student-session.ts */
const VOTER_COOKIE = "envision_voter";

function hasVoterCookie(request: NextRequest): boolean {
  const raw = request.cookies.get(VOTER_COOKIE)?.value;
  if (!raw) return false;
  const parts = raw.split(".");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

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

  let isAdminUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdminUser = profile?.role === "admin";
  }

  const pathname = request.nextUrl.pathname;
  const isLegacyAdminLogin = pathname === LEGACY_ADMIN_LOGIN_PATH;
  const isLogin = pathname === LOGIN_PATH;
  const isAdminLoginApi = pathname === "/api/auth/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isLegacyAdminLogin;
  const isGalleryRoute = pathname.startsWith(GALLERY_PATH);
  const isAdminApi =
    (pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/auth/admin")) &&
    !isAdminLoginApi;
  const isVoterSession = hasVoterCookie(request);

  if (isLegacyAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    if (!url.searchParams.get("redirect")) {
      url.searchParams.set("redirect", "/admin");
    }
    return NextResponse.redirect(url);
  }

  // Student gallery is voter-only (PRD: students browse gallery after entry).
  // Admins manage projects in /admin — they must not use /gallery.
  if (isGalleryRoute) {
    if (isAdminUser) {
      const url = request.nextUrl.clone();
      url.search = "";
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (!isVoterSession) {
      const url = request.nextUrl.clone();
      url.search = "";
      url.pathname = "/vote";
      return NextResponse.redirect(url);
    }
  }

  // Voting-session students must not reach admin login or the admin panel.
  if (isVoterSession && !isAdminUser && (isAdminRoute || isLogin || isLegacyAdminLogin)) {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = GALLERY_PATH;
    return NextResponse.redirect(url);
  }

  if (isLogin && isAdminUser) {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute || isAdminApi) {
    if (!user || !isAdminUser) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: !user ? "Unauthorized" : "Forbidden" },
          { status: !user ? 401 : 403 },
        );
      }

      const url = request.nextUrl.clone();
      if (isVoterSession) {
        url.search = "";
        url.pathname = GALLERY_PATH;
        return NextResponse.redirect(url);
      }

      url.pathname = LOGIN_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
