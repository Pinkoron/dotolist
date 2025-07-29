'use client';

import { useEffect } from 'react';

export default function LoginOut() {
  useEffect(() => {
    // Hosted UI にリダイレクト
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID; // CognitoのApp client ID
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
    const logoutUri = `${baseApiUrl}/auth/logout`; // トークン受け取り先

    const hostedUIUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    window.location.href = hostedUIUrl;
  }, []);

  return <div>ログアウトにリダイレクト中...</div>;
}
