import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deploySha } from "@/lib/deploy";
import { isQaMode } from "@/lib/qa";

export function proxy(request: NextRequest) {
  if (!isQaMode(request.nextUrl.searchParams.get("qa"))) {
    return NextResponse.next();
  }

  const sha = deploySha();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-deploy-sha", sha);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-deploy-sha", sha);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
