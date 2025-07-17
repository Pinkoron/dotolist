// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// middleware 適用対象
export const config = {
  matcher: ["/"], // 必要なパスだけに適用
};
