import { NextResponse } from "next/server";

type AuthInfo =
  | { id_token: string; access_token: string; refresh_token: string }
  | NextResponse;

export const fetchCognitoTokens = async (
  code: string,
  clientId: string,
  domain: string,
  redirectUri: string
): Promise<AuthInfo> => {
  //cognitoにアクセスしてcodeを渡してトークン取得
  const tokenRes = await fetch(`https://${domain}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
    }),
  });

  //[エラー検出]レスポンスがうまくいかなかったらエラー
  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("トークン取得失敗:", errorText);
    return new NextResponse("Failed to fetch token", { status: 500 });
  }

  //jsonから使える形式に変換
  const tokenJson = await tokenRes.json();
  const { id_token, access_token, refresh_token } = tokenJson;

  return { id_token, access_token, refresh_token };
};
