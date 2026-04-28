import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器',
    template: '%s | 哄哄模拟器',
  },
  description: '情侣互动游戏：在10轮内把生气的TA哄好！',
  keywords: ['哄哄模拟器', '情侣游戏', '互动游戏', '模拟器'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
