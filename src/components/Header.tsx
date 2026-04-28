'use client';

import Link from 'next/link';
import { Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            哄哄模拟器
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" />
                {user.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                登出
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600" size="sm">注册</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
