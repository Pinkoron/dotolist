// app/api/todo/add-todo/route.ts
import { NextResponse } from "next/server";
import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // セッションを取得
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    //ユーザーIDを取得
    if (!session.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディをパース
    const body = await request.json();
    const { userId, taskId, isComplete } = body;

    // バリデーション

    // セッションのuserIdと一致するか確認
    if (userId !== session.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: userId mismatch" },
        { status: 403 }
      );
    }

    // DynamoDBに保存
    const command = new UpdateItemCommand({
      TableName: "Todos",
      Key: {
        userId: { S: userId },
        taskId: { S: taskId },
      },
      UpdateExpression: "SET isComplete = :newVal",
      ExpressionAttributeValues: {
        ":newVal": { BOOL: !isComplete },
      },
    });

    await client.send(command);
    return NextResponse.json({ message: "success move" }, { status: 201 });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
