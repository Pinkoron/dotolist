import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";
import jwt from "jsonwebtoken";
import { SessionData } from "@/lib/session";

export const saveSessionAndRedirect = async (
  req: NextRequest,
  access_token: string,
  user_id: string,
  email: string,
  expires_in: number,
  redirectUrl: string
): Promise<NextResponse> => {
  //アクセストークンの有効期限を取得
  let expiresAt: Date;
  const decoded = jwt.decode(access_token);
  if (decoded && typeof decoded === "object" && "exp" in decoded) {
    const expUnix = decoded.exp as number;
    expiresAt = new Date(expUnix * 1000);
  } else {
    // fallback to expires_in
    expiresAt = new Date(Date.now() + expires_in * 1000);
  }
  //リダイレクトのひな形を作る
  const res = new NextResponse(null, { status: 302 });
  //リダイレクト内ヘッダーを決める
  res.headers.set("Location", redirectUrl);

  //キャッシュで保存する仕組みを作る
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  //キャッシュに保存する内容をセット
  session.user = {
    accessToken: access_token,
    userId: user_id,
    email: email,
    expUnix: expiresAt,
  };
  //キャッシュに保存
  await session.save();
  //リダイレクトを返す
  return res;
};
