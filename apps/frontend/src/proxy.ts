import { NextResponse, type NextRequest } from "next/server";

const OLYMPIAD_PAGE = "/admin/globals/olympiad-page";
const COOKIE = "cna-admin-locale";

/**
 * Only the Olympiad page is edited in two languages. Payload remembers the last language picked
 * there (per account), so any other admin page reached after picking Gujarati is sent back to
 * English straight away; the choice never sticks beyond the Olympiad page.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = searchParams.get("locale");

  if (pathname.startsWith(OLYMPIAD_PAGE)) {
    const response = NextResponse.next();
    if (locale) response.cookies.set(COOKIE, locale, { path: "/admin", httpOnly: true, sameSite: "strict" });
    return response;
  }

  if (request.cookies.get(COOKIE)?.value === "gu" && locale !== "en") {
    const url = request.nextUrl.clone();
    url.searchParams.set("locale", "en");
    const response = NextResponse.redirect(url);
    response.cookies.delete({ name: COOKIE, path: "/admin" });
    return response;
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
