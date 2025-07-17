import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

//セッションに保存したいデータの型を定義
type SessionData = {
    user?: {
      email: string;
      idToken: string;
      accessToken: string;
    };
  };

  //APIのGETリクエストに対する関数を定義
export async function GET(req: Request) {
  const res = new Response(); // resが必要

  //セッションを作る
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  //ダミーデータ
  session.user = {
    email: "test@example.com",
    idToken: "dummy-id",
    accessToken: "dummy-access",
  };

  // セッションを保存して、レスポンスヘッダーに Cookie を付与
  await session.save();
  console.log(res.headers);

  // レスポンスとして「保存完了」と返す
  return new Response("session.user setログリン成功", {
    status: 200,
    headers: res.headers, // ← これ大事！Set-Cookieが出力される
  });
}
