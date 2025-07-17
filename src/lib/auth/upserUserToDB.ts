import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";

export const upsertUserToDB = async (
  userId: string,
  email: string,
  refresh_token: string
): Promise<void> => {
  //今日の日付取得
  const today = new Date().toISOString();

  //該当する1件のデータをください」というリクエストを送るためのオブジェクト
  //DynamoDBClient.set(指示)でDB操作
  const getCmd = new GetItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      userId: { S: userId }, // パーティションキーが userIdの前提
    },
  });
  //検索結果を取得
  const result = await client.send(getCmd);
  console.log(`リザルトの結果は${result}`);

  // ✅ ユーザーが存在しない場合 → 作成
  if (!result.Item) {
    const putCmd = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        userId: { S: userId },
        email: { S: email },
        token: { S: refresh_token },
        lastLoginAt: { S: today },
        createdAt: { S: today },
        // 必要に応じて token 情報なども追加可
      },
    });

    await client.send(putCmd);
  } else {
    const updateCmd = new UpdateItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        userId: { S: userId },
      },
      UpdateExpression: "SET #token = :token, lastLoginAt = :time",
      ExpressionAttributeNames: {
        "#token": "token", // ← 予約語の回避
      },
      ExpressionAttributeValues: {
        ":token": { S: refresh_token },
        ":time": { S: new Date().toISOString() },
      },
    });
    await client.send(updateCmd);
  }
};
