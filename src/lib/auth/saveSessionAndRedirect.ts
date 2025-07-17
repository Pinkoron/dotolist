import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";
import jwt from "jsonwebtoken";

type SessionData = {
  user?: {
    idToken: string;
    email: string;
    accessToken: string;
    expUnix: Date;
  };
};

export const saveSessionAndRedirect = async (
  req: NextRequest,
  id_token: string,
  access_token: string,
  email: string,
  redirectUrl: string
): Promise<NextResponse> => {
  //アクセストークンの有効期限を取得
  const decoded = jwt.decode(access_token) as { exp?: number; iat?: number };
  const expUnix = decoded.exp!; // 有効期限（秒単位のUNIX時間）
  const expiresAt = new Date(expUnix * 1000); // → Dateオブジェクトに変換

  //リダイレクトのひな形を作る
  const res = new NextResponse(null, { status: 302 });
  //リダイレクト内ヘッダーを決める
  res.headers.set("Location", redirectUrl);

  //キャッシュで保存する仕組みを作る
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  //キャッシュに保存する内容をセット
  session.user = {
    idToken: id_token,
    accessToken: access_token,
    email: email,
    expUnix: expiresAt,
  };
  //キャッシュに保存
  await session.save();
  //リダイレクトを返す
  return res;
};
