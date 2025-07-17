// app/dashboard/page.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import { redirect } from "next/navigation";

type SessionData = {
    user?: {
        idToken: string;
        email: string;
        accessToken: string;
    };
};

export default async function DashboardPage() {
    const cookieStore = await cookies(); // ✅ App Router ではこれ
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.user) {
        redirect("/"); // 未ログインならトップページへ
    }

    return (
        <div>
            <h1>Welcome, {session.user.email}</h1>
        </div>
    );
}
