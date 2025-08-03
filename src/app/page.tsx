// app/dashboard/page.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { SessionData } from "@/lib/session";
import HomeClient from "./HomeClient";

export default async function Home() {
  const cookieStore = await cookies(); // ✅ App Router ではこれ
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (session.user) {
    redirect("/dashboard"); // 未ログインならトップページへ
  }

  return <HomeClient user={session.user} />;
}
