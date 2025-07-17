// app/api/todo/route.ts
import { NextResponse } from "next/server";
import client from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    console.log("Table:", process.env.DYNAMODB_TABLE_NAME);
    console.log("Region:", process.env.AWS_REGION);
    console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID?.slice(0, 5)); // 一部だけ出力
    console.log(
      "Secret Access Key:",
      process.env.AWS_SECRET_ACCESS_KEY ? "✅ set" : "❌ missing"
    );

    const data = await client.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
      })
    );
    return NextResponse.json(data.Items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "データ取得に失敗しました" },
      { status: 500 }
    );
  }
}
