'use client';

import { useEffect, useState } from 'react';
import { Edit, Search } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: number;
  username: string;
  email: string | null;
  status: string;
  isAdmin: boolean;
  createdAt: number;
}

interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<{
    search: string;
    status: string | undefined;
  }>({
    search: '',
    status: undefined,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data: UserListResponse = await res.json();
        setUsers(data.data);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
        });
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const handleEditStatus = (user: User) => {
    setEditingUser(user);
    setNewStatus(user.status);
    setEditDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        alert('更新失败');
      }
    } catch (e) {
      alert('更新失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 'secondary';
    const label = status === 'active' ? '正常' : '禁用';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('zh-CN');
  };

  return (
    <AdminLayout title="用户管理">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">搜索与筛选</CardTitle>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <div className="text-sm text-gray-500 mb-1">搜索用户名</div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="输入用户名搜索"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="w-40">
              <div className="text-sm text-gray-500 mb-1">状态</div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setPagination({ ...pagination, page: 1 });
                fetchUsers();
              }}
            >
              搜索
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">加载中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>管理员</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge variant="default">是</Badge>
                        ) : (
                          '否'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStatus(user)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          编辑状态
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  暂无用户数据
                </div>
              )}

              {/* 简单分页 */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                      上一页
                    </Button>
                    <span className="py-1 px-3 text-sm">
                      第 {pagination.page} / {pagination.totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 编辑状态弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户状态</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="text-sm">
                <span className="text-gray-500">用户名：</span>
                <span className="font-medium">{editingUser.username}</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">设置状态</div>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">正常</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveStatus}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
