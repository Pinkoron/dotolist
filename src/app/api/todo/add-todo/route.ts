// app/api/todo/add-todo/route.ts
import { NextResponse } from "next/server";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
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
    const newTodo = body.Todo;

    // バリデーション
    if (!newTodo || typeof newTodo !== "object") {
      return NextResponse.json(
        { error: "Invalid Todo object" },
        { status: 400 }
      );
    }
    if (!newTodo.Task || typeof newTodo.Task !== "string") {
      return NextResponse.json(
        { error: "Invalid task title" },
        { status: 400 }
      );
    }
    if (!newTodo.taskId || typeof newTodo.taskId !== "string") {
      return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });
    }
    if (typeof newTodo.isComplete !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isComplete value" },
        { status: 400 }
      );
    }

    // セッションのuserIdと一致するか確認
    if (newTodo.userId !== session.user.userId) {
      return NextResponse.json(
        { error: "Forbidden: userId mismatch" },
        { status: 403 }
      );
    }

    // DynamoDBに保存
    const putCmd = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_TASK,
      Item: {
        userId: { S: newTodo.userId },
        taskId: { S: newTodo.taskId },
        Task: { S: newTodo.Task },
        isComplete: { BOOL: newTodo.isComplete },
      },
    });

    await client.send(putCmd);
    return NextResponse.json({ message: "Todo created" }, { status: 201 });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
