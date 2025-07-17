import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

type SessionData = {
  user?: {
    idToken: string;
    email: string;
    accessToken: string;
    expUnix: string;
  };
};

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.json({ loggedIn: false }, { status: 200 }); // ← 401だと毎回エラーになるので注意
  }

  return NextResponse.json({ loggedIn: true, user: session.user });
}
