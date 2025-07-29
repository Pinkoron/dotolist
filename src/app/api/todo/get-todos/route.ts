// app/api/todo/route.ts
import { NextResponse } from "next/server";
import client from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );
    const userId = session.user?.userId!;

    //console.log(`ユーザーIDは:${userId}`);
    const getCmd = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_TASK,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    });
    //検索結果を取得
    const result = await client.send(getCmd);

    //未完了タスクと完了タスクを分割代入。
    const items = result.Items?.map((item) => unmarshall(item)) || [];

    // 配列をisCompleteで分ける
    const incompleteTodos = items.filter((item) => !item.isComplete);
    const completeTodos = items.filter((item) => item.isComplete);
    //

    // console.log(incompleteTodos);
    // console.log(completeTodos);

    // ブラウザに結果を返す（これが重要！）

    console.log("200を返すよ！");
    return NextResponse.json(
      {
        incompleteTodos,
        completeTodos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("エラーだよ！");
    //console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
