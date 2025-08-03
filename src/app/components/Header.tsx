'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();


  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);
      } catch (error) {
        console.error("ログイン確認失敗:", error);
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, [pathname]);

  return (
    <header className="p-4 bg-gray-100">
      <div className="max-w-2xl flex justify-between items-center mx-auto">
        <Link href="/" className="text-xl font-bold hover:text-blue-600 transition">TODOアプリ</Link>

        <div>{isLoggedIn ?
          <Link href="/logout" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
            ログアウト
          </Link>
          : <Link href="/login" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
            ログイン
          </Link>
        }</div>
      </div>
    </header>
  );
}
