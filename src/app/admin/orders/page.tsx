'use client';

import { useEffect, useState } from 'react';
import { Edit, Eye, Search, Plus } from 'lucide-react';
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

interface Order {
  id: number;
  orderNo: string | null;
  userId: number;
  amount: number | null;
  status: string;
  remark: string | null;
  createdAt: number;
  username: string | null;
}

interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data: OrderListResponse = await res.json();
        setOrders(data.data);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
        });
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const handleViewDetail = async (order: Order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setDetailDialogOpen(true);
      }
    } catch (e) {
      console.error('Failed to fetch order detail', e);
    }
  };

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setEditDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEditDialogOpen(false);
        fetchOrders();
      } else {
        alert('更新失败');
      }
    } catch (e) {
      alert('更新失败');
    }
  };

  const handleCreateOrder = async () => {
    // 简单演示创建订单
    const userId = prompt('请输入用户ID（例如1）:') || '';
    if (!userId) return;
    const amount = prompt('请输入订单金额（分）:') || '';

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          amount: amount ? parseInt(amount) : 0
        }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('创建失败');
      }
    } catch (e) {
      alert('创建失败');
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge className={statusColors[status] || ''} variant="outline">
      {statusLabels[status] || status}
    </Badge>
  );

  const formatAmount = (cents: number | null) => {
    if (cents === null) return '-';
    return `¥${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('zh-CN');
  };

  return (
    <AdminLayout title="订单管理">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <CardTitle className="text-base">订单列表</CardTitle>
            <Button onClick={handleCreateOrder} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              创建订单
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <div className="text-sm text-gray-500 mb-1">搜索订单号</div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="输入订单号搜索"
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
                  <SelectItem value="pending">待支付</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setPagination({ ...pagination, page: 1 });
                fetchOrders();
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
                    <TableHead>订单号</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {order.orderNo || `-`}
                      </TableCell>
                      <TableCell>{order.username || '-'}</TableCell>
                      <TableCell>{formatAmount(order.amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            详情
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStatus(order)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            状态
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {orders.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  暂无订单数据（可点击创建订单添加演示数据）
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

      {/* 订单详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">订单ID：</span>
                  <span className="font-medium">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">订单号：</span>
                  <span className="font-medium font-mono">
                    {selectedOrder.orderNo || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">用户：</span>
                  <span className="font-medium">{selectedOrder.username || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">金额：</span>
                  <span className="font-medium">{formatAmount(selectedOrder.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-500">状态：</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <span className="text-gray-500">创建时间：</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>
              {selectedOrder.remark && (
                <div>
                  <span className="text-gray-500 text-sm">备注：</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                    {selectedOrder.remark}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑状态弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑订单状态</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="text-sm">
                <span className="text-gray-500">订单：</span>
                <span className="font-medium">{selectedOrder.orderNo || selectedOrder.id}</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">设置状态</div>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待支付</SelectItem>
                    <SelectItem value="paid">已支付</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
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
