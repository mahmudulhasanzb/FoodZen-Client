import { NextResponse } from "next/server";

// Auth guard added in US-01
export function middleware(_request) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
