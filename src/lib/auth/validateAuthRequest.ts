import { NextRequest, NextResponse } from "next/server";

type AuthInfo =
  | { code: string; clientId: string; domain: string; redirectUri: string }
  | NextResponse;

export const validateAuthRequest = (
  req: NextRequest,
  clientId: string,
  domain: string,
  redirectUri: string,
  expectedState?: string
): AuthInfo => {
  //[エラー検出]引数に問題がないか確認
  if (!req || !clientId || !domain || !redirectUri) {
    console.error("環境変数が不足しています");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  //コードを取得
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new NextResponse("Code not found", { status: 400 });
  }

  if (expectedState && state !== expectedState) {
    return new NextResponse("Invalid state parameter", { status: 403 });
  }

  return { code, clientId, domain, redirectUri };
};
