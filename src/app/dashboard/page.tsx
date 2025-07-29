// app/dashboard/page.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";
import { SessionData } from "@/lib/session";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const cookieStore = await cookies(); // ✅ App Router ではこれ
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.user) {
        redirect("/"); // 未ログインならトップページへ
    }

    return <DashboardClient user={session.user} />;
}
