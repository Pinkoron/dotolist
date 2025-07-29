// middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

// middleware 適用対象
export const config = {
  matcher: ["/"], // 必要なパスだけに適用
};
