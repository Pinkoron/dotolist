import RefreshTokenHandler from '@/app/components/RefreshTokenHandler';
import './globals.css'; // ✅ これが必要！
import Header from '@/app/components/Header'; // パスは環境により調整


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head />
      <body className="min-h-screen bg-white text-gray-800 font-sans">
        <RefreshTokenHandler /> {/* ✅ ここで全体に注入 */}
        <Header />
        <main className="max-w-2xl mx-auto p-4 items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
