'use client';

import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // Hosted UI にリダイレクト

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    console.log(domain);
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID; // CognitoのApp client ID
    const redirectUri = 'http://localhost:3000/api/auth/login'; // トークン受け取り先

    const hostedUIUrl = `https://${domain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = hostedUIUrl;
  }, []);

  return <div>ログインにリダイレクト中...</div>;
}
