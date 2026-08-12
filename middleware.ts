import type { NextRequest } from "next/server";

// Landing page is now the role entry point. No middleware redirect.
export function middleware(request: NextRequest) {
  return undefined;
}


