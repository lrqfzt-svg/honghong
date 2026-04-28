'use client';

import { useEffect, useState } from 'react';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  totalUsers: number;
  recentUsers: number;
  totalOrders: number;
  recentOrders: number;
  totalAmount: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          title: '用户总数',
          value: stats.totalUsers,
          subValue: `${stats.recentUsers} 新增（24h）`,
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          title: '订单总数',
          value: stats.totalOrders,
          subValue: `${stats.recentOrders} 新增（24h）`,
          icon: ShoppingCart,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
        {
          title: '总金额',
          value: `¥${(stats.totalAmount / 100).toFixed(2)}`,
          subValue: '累计交易金额',
          icon: DollarSign,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          title: '概览',
          value: '-',
          subValue: '欢迎使用管理后台',
          icon: TrendingUp,
          color: 'text-pink-600',
          bg: 'bg-pink-50',
        },
      ]
    : [];

  return (
    <AdminLayout title="概览">
      {isLoading ? (
        <div className="text-center py-10">加载中...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.subValue}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>操作提示</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 左侧菜单可切换用户管理和订单管理</li>
                <li>• 当前用户需设为管理员才能访问后台（如何设为管理员见下文）</li>
                <li>• 用户管理支持搜索和状态筛选</li>
                <li>• 订单管理支持查看详情和更新状态</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
