import { NextRequest, NextResponse } from "next/server";
import { validateAuthRequest } from "@/lib/auth/validateAuthRequest";
import { fetchCognitoTokens } from "@/lib/auth/fetchCognitoToken";
import { decodeIdToken } from "@/lib/auth/decodeIdToken";
import { upsertUserToDB } from "@/lib/auth/upserUserToDB";
import { saveSessionAndRedirect } from "@/lib/auth/saveSessionAndRedirect";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

//このAPIはhosetd UIとデータベースから値受け取ります。NextRequestにはクライアントからのリクエストの中身が詰まっている
export async function GET(req: NextRequest) {
  // セッションから期待されるstateを取得（iron-sessionなどで）
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const expectedState = session.oauth_state;

  //バリデーションとコードの取得
  const validatedParams = validateAuthRequest(
    req,
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
    process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
    expectedState
  );
  if (validatedParams instanceof NextResponse) {
    return validatedParams; // エラー応答をそのまま返す
  }
  const { code, clientId, domain, redirectUri } = validatedParams;

  //トークンの取得
  const token = await fetchCognitoTokens(code, clientId, domain, redirectUri);
  if (token instanceof NextResponse) return token;
  const { id_token, access_token, refresh_token, expires_in } = token;

  // ✅ id_token から email を取得（JWT デコード）
  const { userId, email } = decodeIdToken(id_token);

  //ユーザーが存在していなければDB保存。存在していたらリフレッシュトークンだけ保存
  await upsertUserToDB(userId, email, refresh_token);

  //キャッシュに保存
  const redirectResponse = await saveSessionAndRedirect(
    req,
    access_token,
    userId,
    email,
    expires_in,
    "/dashboard"
  );

  //ページの送信
  return redirectResponse;
}
