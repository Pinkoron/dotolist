import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

// 👇 ここでセッションに持たせたい型を定義
type SessionData = {
    user?: {
      email: string;
      idToken: string;
      accessToken: string;
    };
  };
  
//   const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
//   const user = session.user ?? null;
  

export async function GET(req: Request) {
  const res = new Response();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const user = session.user ?? null;
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
