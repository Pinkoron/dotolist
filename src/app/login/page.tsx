'use client';
import { useEffect } from 'react';

const redirectToHostedUI = async () => {
  const res = await fetch('/api/auth/start', { credentials: 'include' });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.hostedUIUrl; // URL文字列を返す
};
export default function LoginPage() {
  useEffect(() => {
    const redirect = async () => {
      try {
        const url = await redirectToHostedUI();
        window.location.href = url; // URL文字列でリダイレクト
      } catch (e) {
        console.error(e);
      }
    };

    redirect();
  }, []);

  return <div>ログインにリダイレクト中...</div>;
}
