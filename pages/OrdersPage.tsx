/**
 * LUNARA - PAGE: ORDERS PAGE (หน้ารายการคำสั่งซื้อ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (GET /api/orders)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (useState, useEffect, Tab Filtering)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * รายการข้อมูลที่ต้องแสดงในแต่ละ Order:
 * 1. Order ID
 * 2. Product list (ชื่อสินค้า, ไซส์, รูป, จำนวน)
 * 3. Total price (ยอดเงินรวม)
 * 4. Date (วันที่และเวลาสั่งซื้อ)
 * 5. Status: Ordered | Preparing | Shipping | Completed
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, Truck, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchOrders } from '../services/api';

interface OrdersPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, onViewProduct }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ดึงข้อมูลคำสั่งซื้อจาก API
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const statusColors: Record<OrderStatus, { bg: string; text: string; icon: any }> = {
    Ordered: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Clock },
    Preparing: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Package },
    Shipping: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Truck },
    Completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  };

  const statusLabels: Record<OrderStatus, string> = {
    Ordered: 'รับคำสั่งซื้อแล้ว (Ordered)',
    Preparing: 'กำลังเตรียมจัดส่ง (Preparing)',
    Shipping: 'กำลังจัดส่งพัสดุ (Shipping)',
    Completed: 'จัดส่งสำเร็จ (Completed)',
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C5C8]/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C5258]">
            <Sparkles className="w-4 h-4 text-[#C6A24D]" />
            <span>ORDER HISTORY</span>
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723] mt-1">
            รายการคำสั่งซื้อของคุณ
          </h1>
          <p className="text-sm text-[#8C7063]">
            ติดตามสถานะและตรวจสอบประวัติการสั่งซื้อกำไลหินมงคลทั้งหมด
          </p>
        </div>

        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs sm:text-sm font-semibold text-[#8C5258] hover:text-[#5C2E33] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>ช้อปปิ้งต่อ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            filterStatus === 'all'
              ? 'bg-[#8C5258] text-white shadow-xs'
              : 'bg-white text-[#5C4D4A] border border-[#D9C8BE] hover:bg-[#FAF7F2]'
          }`}
        >
          ทั้งหมด ({orders.length})
        </button>
        {(['Ordered', 'Preparing', 'Shipping', 'Completed'] as OrderStatus[]).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-[#8C5258] text-white shadow-xs'
                : 'bg-white text-[#5C4D4A] border border-[#D9C8BE] hover:bg-[#FAF7F2]'
            }`}
          >
            {st} ({orders.filter((o) => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Order List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white/70 rounded-3xl animate-pulse border border-[#E8C5C8]/40" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8C5C8]/40 space-y-4">
          <Package className="w-12 h-12 mx-auto text-[#C6A24D]" />
          <h3 className="font-serif text-xl font-bold text-[#3E2723]">
            ยังไม่มีคำสั่งซื้อในสถานะนี้
          </h3>
          <p className="text-sm text-[#8C7063]">
            เมื่อคุณสั่งซื้อสินค้า รายการคำสั่งซื้อจะปรากฏที่หน้านี้โดยอัตโนมัติ
          </p>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-6 py-2.5 rounded-full bg-[#8C5258] text-white text-xs font-semibold"
          >
            เลือกซื้อกำไลหินมงคล
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusConfig = statusColors[order.status] || statusColors.Ordered;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/40 shadow-xs space-y-5 hover:border-[#C6A24D]/40 transition-all"
              >
                {/* Header: Order ID, Date & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2EBE1]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-[#8C5258]">
                        {order.id}
                      </span>
                      <span className="text-xs text-[#8C7063]">
                        • {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C7063]">
                      ผู้รับ: {order.customerName} | เบอร์โทร: {order.phone}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusLabels[order.status]}</span>
                  </div>
                </div>

                {/* Products List inside Order */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 py-2 border-b last:border-b-0 border-[#FAF4ED]"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        onClick={() => onViewProduct(item.product.id)}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-[#E8C5C8]/30 cursor-pointer hover:opacity-85 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => onViewProduct(item.product.id)}
                          className="font-semibold text-sm sm:text-base text-[#3E2723] hover:text-[#8C5258] cursor-pointer truncate"
                        >
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#8C7063] mt-0.5">
                          <span>หิน: {item.product.stone}</span>
                          <span>• ไซส์: {item.selectedSize}</span>
                          <span>• จำนวน: {item.quantity} เส้น</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#8C5258]">
                        ฿{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: Payment Method & Total */}
                <div className="pt-3 border-t border-[#F2EBE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="text-[#8C7063]">
                    <span>ชำระผ่าน: <strong>{order.paymentMethod}</strong></span>
                    {order.shippingFee === 0 ? (
                      <span className="ml-2 text-emerald-700 font-semibold">• ฟรีค่าจัดส่ง</span>
                    ) : (
                      <span className="ml-2">• ค่าส่ง ฿{order.shippingFee}</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-[#8C7063]">ยอดรวมสุทธิ:</span>
                    <span className="text-xl font-bold text-[#8C5258]">
                      ฿{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
