import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";
import { sessionOptions, SessionData } from "@/lib/session";
import { decodeIdToken } from "@/lib/auth/decodeIdToken";
import { upsertUserToDB } from "@/lib/auth/upserUserToDB";

export async function POST(req: NextRequest) {
  console.log("リフレッシュ開始");
  try {
    // 現在のアイロンセッションを取得
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );
    console.log("セッション取得:", session);

    //もしemailなければ401
    if (!session.user?.email) {
      console.warn("ユーザーセッションがありません");
      return NextResponse.json(
        { error: "User session not found" },
        { status: 401 }
      );
    }
    console.log("ユーザー email:", session.user.email);

    // DBよりユーザーの情報を取得
    const getCommand = new GetItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        userId: { S: session.user.userId },
      },
    });
    console.log("DynamoDBからトークン取得コマンド準備");
    const result = await client.send(getCommand);
    console.log("DynamoDB応答:", result);

    //リフレッシュトークンを取得
    if (!result.Item?.token?.S) {
      console.warn("DynamoDBにリフレッシュトークンがありません");
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }
    const refreshToken = result.Item.token.S;
    console.log("取得したリフレッシュトークン:", refreshToken);

    //リフレッシュトークンを使って新しいアクセストークンをもらうやり方。
    const tokenResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        }),
      }
    );
    console.log("Cognitoトークン応答ステータス:", tokenResponse.status);

    if (!tokenResponse.ok) {
      console.error("トークンリフレッシュ失敗");
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 400 }
      );
    }
    const tokenData = await tokenResponse.json();
    console.log("Cognitoトークンデータ:", tokenData);

    //トークンデータがだめだったら400
    if (!tokenData.id_token) {
      console.warn("IDトークンが不正");
      return NextResponse.json(
        { error: "Invalid token response" },
        { status: 400 }
      );
    }

    //idトークンを
    const decoded = decodeIdToken(tokenData.id_token);
    if (!decoded) {
      console.warn("IDトークンのデコード失敗");
      return NextResponse.json(
        { error: "Failed to decode ID token" },
        { status: 400 }
      );
    }
    console.log("デコード済みユーザー情報:", decoded);

    //DBの更新
    if (tokenData.refresh_token) {
      console.log("DBのリフレッシュトークンを更新");
      await upsertUserToDB(
        decoded.userId,
        decoded.email,
        tokenData.refresh_token
      );
    }
    console.log(`更新したアクセストークン${tokenData.access_token}`);
    // セッションを新しいトークンで更新。iron-session
    session.user = {
      email: decoded.email,
      userId: decoded.userId,
      accessToken: tokenData.access_token,
      expUnix: new Date(Date.now() + tokenData.expires_in * 1000),
    };

    await session.save();
    console.log("セッション保存完了:", session.user);

    return NextResponse.json({
      message: "Token refreshed successfully",
      expUnix: session.user.expUnix,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
