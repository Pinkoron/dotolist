// app/api/auth/logout/route.ts

import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

type SessionData = {
  user?: {
    idToken: string;
    accessToken: string;
    refreshToken: string;
  };
};

export async function GET(req: NextRequest) {
  const res = new NextResponse(null, { status: 302 });
  res.headers.set("Location", "/"); // ログアウト後のリダイレクト先

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  await session.destroy(); // 👈 これでセッションを削除

  return res;
}
