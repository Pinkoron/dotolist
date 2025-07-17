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
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  }

  return NextResponse.json(session.user.expUnix);
}
