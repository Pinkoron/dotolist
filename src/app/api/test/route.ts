import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.next(); // NextResponse()ではなくNextResponse.next()が正しいです

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user) {
    return NextResponse.json({ loggedIn: false }, { status: 200 }); // 401は避けるのが一般的
  }

  const access_token = session.user.accessToken;
  console.log("Access Token:", access_token);

  return NextResponse.json({
    loggedIn: true,
    accessToken: access_token,
    user: session.user,
  });
}
