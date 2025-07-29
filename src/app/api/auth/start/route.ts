import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(req: Request) {
  const res = NextResponse.next();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const state = randomBytes(16).toString("hex");
  session.oauth_state = state;
  await session.save();

  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;
  const hostedUIUrl = `https://${domain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;

  return NextResponse.json({ hostedUIUrl }); // 必須
}
