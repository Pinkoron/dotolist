'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshTokenHandler() {
    const pathname = usePathname();

    useEffect(() => {
        const checkSession = async () => {
            alert("チェックします");
            try {
                const res = await fetch('/api/auth/token-expiry', {
                    credentials: 'include',
                });
                if (res.ok) {
                    alert("ログインしてました");
                    const expUnix = new Date(await res.json());
                    const now = new Date();

                    const hoursPassed = (expUnix.getTime() - now.getTime()) / (1000 * 60 * 60);
                    alert(hoursPassed);
                    console.log(hoursPassed);
                    if (hoursPassed <= -24) {
                        window.location.href = '/logout';
                    } else if (hoursPassed <= 0.083) {
                        //リフレッシュ処理
                        //await fetch('/api/refresh');
                    }
                } else {
                    console.log("ログインしてないのでなんもないっす！");
                }
            } catch (err) {
                console.error('セッションチェック失敗:', err);
            }
        }

        checkSession();
    }, [pathname]);

    return null;
}
