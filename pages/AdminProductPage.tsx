/**
 * LUNARA - PAGE: ADMIN PRODUCT CRUD & GOOGLE OAUTH
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create, Read, Update, Delete)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form (RHF)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: REST API Integration]
 *
 * สิทธิ์ผู้ดูแลระบบ (Admin) ด้วย Google OAuth:
 * 1. ผู้ใช้ต้องล็อกอินด้วย Google จึงจะสามารถ เพิ่ม ลบ หรือแก้ไขสินค้าได้
 * 2. มีคู่มือและคำอธิบายโค้ดสำหรับเชื่อมต่อ Google Cloud Console ชัดเจน
 * 3. มีปุ่ม Demo Google Sign-in ให้นักศึกษาและอาจารย์กดทดสอบได้ทันที
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Image as ImageIcon,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  Layers,
  Key,
} from 'lucide-react';
import { Product, ProductFormValues } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProductForm } from '../components/ProductForm';
import { createProduct, updateProduct, deleteProduct } from '../services/api';

interface AdminProductPageProps {
  products: Product[];
  onProductsChange: (updated: Product[]) => void;
  onViewProduct: (id: string) => void;
}

export const AdminProductPage: React.FC<AdminProductPageProps> = ({
  products,
  onProductsChange,
  onViewProduct,
}) => {
  const { adminUser, isAdmin, loginWithGoogle, logout, isLoading } = useAuth();

  // 1. [State] Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. [State] Search & Filter in Admin Table
  const [searchTable, setSearchTable] = useState('');
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);

  // --------------------------------------------------------------------------
  // [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD Operations]
  // --------------------------------------------------------------------------

  // CREATE / UPDATE Handler
  const handleFormSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // UPDATE (PUT /api/products/:id)
        const updated = await updateProduct(editingProduct.id, {
          ...values,
          colors: values.colors as any,
          intentions: values.intentions as any,
        });

        const newProductsList = products.map((p) =>
          p.id === updated.id ? updated : p
        );
        onProductsChange(newProductsList);
        alert(`แก้ไขสินค้า "${updated.name}" เรียบร้อยแล้ว`);
      } else {
        // CREATE (POST /api/products)
        const created = await createProduct({
          ...values,
          colors: values.colors as any,
          intentions: values.intentions as any,
        });

        onProductsChange([created, ...products]);
        alert(`เพิ่มสินค้า "${created.name}" เข้าสู่ระบบสำเร็จ`);
      }

      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE Handler (DELETE /api/products/:id)
  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${product.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้`
    );
    if (!confirmDelete) return;

    try {
      await deleteProduct(product.id);
      onProductsChange(products.filter((p) => p.id !== product.id));
      alert(`ลบสินค้า "${product.name}" เรียบร้อยแล้ว`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  // กรองสินค้าในตาราง
  const filteredInAdmin = products.filter((p) => {
    const q = searchTable.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.stone.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C5C8]/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C5258]">
            <Sparkles className="w-4 h-4 text-[#C6A24D]" />
            <span>ADMINISTRATOR PORTAL</span>
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723] mt-1">
            จัดการสินค้าหลังร้าน (Product CRUD)
          </h1>
          <p className="text-sm text-[#8C7063]">
            เพิ่ม ลบ และแก้ไขข้อมูลกำไลหินมงคล พร้อมการตรวจสอบความถูกต้องด้วย RHF + Zod
          </p>
        </div>

        {/* OAuth Guide Toggle */}
        <button
          type="button"
          onClick={() => setShowOAuthGuide(!showOAuthGuide)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D9C8BE] text-xs font-semibold text-[#4A3E3D] hover:border-[#C6A24D] shadow-xs self-start sm:self-auto"
        >
          <Key className="w-3.5 h-3.5 text-[#C6A24D]" />
          <span>{showOAuthGuide ? 'ซ่อนคู่มือ Google OAuth' : 'คู่มือการเชื่อมต่อ Google OAuth'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* GOOGLE OAUTH GUIDE BOX (คำอธิบายสำหรับอาจารย์ & นักศึกษา) */}
      {/* ------------------------------------------------------------------ */}
      {showOAuthGuide && (
        <div className="p-6 bg-white rounded-3xl border border-[#C6A24D]/40 shadow-sm space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-lg font-bold text-[#3E2723]">
                🔐 วิธีการเชื่อมต่อ Google OAuth ในโปรเจกต์นี้
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              สำหรับรายงานและนำเสนออาจารย์
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-[#5C4D4A]">
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8C5C8]/40 space-y-1.5">
              <strong className="text-[#3E2723] block text-sm">1. Google Cloud Console</strong>
              <p>สร้าง OAuth 2.0 Client ID ประเภท Web Application กำหนด Authorized Origin เป็นโดเมนเว็บ</p>
              <code className="text-[11px] block bg-white p-1 rounded border">VITE_GOOGLE_CLIENT_ID</code>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8C5C8]/40 space-y-1.5">
              <strong className="text-[#3E2723] block text-sm">2. Frontend Authentication</strong>
              <p>เรียกใช้ฟังก์ชัน <code>loginWithGoogle()</code> ใน <code>src/context/AuthContext.tsx</code> ซึ่งจะบันทึกสถานะผู้ดูแลระบบ</p>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8C5C8]/40 space-y-1.5">
              <strong className="text-[#3E2723] block text-sm">3. Backend REST API</strong>
              <p>ตรวจสอบความถูกต้องผ่าน <code>POST /api/auth/google</code> ใน <code>server.ts</code> เพื่อยืนยันสิทธิ์ Role: admin</p>
            </div>
          </div>

          {/* Photo replacement guide */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <strong className="block text-sm">📸 คำแนะนำในการเปลี่ยนรูปภาพกำไลหินของทางร้าน:</strong>
            <p>
              คุณสามารถนำรูปภาพจากเครื่องไปวางในโฟลเดอร์ <code>public/images/</code> แล้วพิมพ์ <code>/images/ชื่อไฟล์.jpg</code> ในช่องรูปภาพ หรือวางลิงก์รูปภาพ (Direct URL) ได้ทันทีเมื่อกดปุ่ม "เพิ่มสินค้าใหม่" หรือ "แก้ไข"
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* AUTHENTICATION GATE */}
      {/* ------------------------------------------------------------------ */}
      {!isAdmin ? (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border border-[#E8C5C8]/60 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4ED] text-[#8C5258] flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-[#8C5258]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-brand text-2xl font-bold text-[#3E2723]">
              เข้าสู่ระบบผู้ดูแลระบบ (Admin Access)
            </h2>
            <p className="text-sm text-[#8C7063] leading-relaxed">
              ฟังก์ชันเพิ่ม แก้ไข และลบสินค้า (CRUD) สงวนสิทธิ์เฉพาะผู้ดูแลระบบที่ผ่านการตรวจสอบสิทธิ์ด้วย Google OAuth เท่านั้น
            </p>
          </div>

          {/* Google Sign In Action */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => loginWithGoogle({ email: 'natpapattep@gmail.com', name: 'อาจารย์ / ผู้ตรวจโปรเจกต์' })}
              className="w-full py-3.5 px-6 rounded-full bg-white border border-[#D9C8BE] hover:border-[#4285F4] text-[#3E2723] font-semibold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-3 active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Google Sign-In)</span>
            </button>

            <p className="text-[11px] text-[#8C7063]">
              * คลิกลิงก์ด้านบนเพื่อยืนยันสิทธิ์แอดมินจำลองสำหรับการตรวจงานได้ทันที
            </p>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* LOGGED IN ADMIN VIEW */
        /* ------------------------------------------------------------------ */
        <div className="space-y-6">
          {/* Admin Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8C5C8]/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="Admin avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C6A24D]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm sm:text-base text-[#3E2723]">
                    {adminUser?.name}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Verified
                  </span>
                </div>
                <p className="text-xs text-[#8C7063]">{adminUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Add New Product Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้าใหม่</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-full text-[#8C7063] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Modal / Panel */}
          {isFormOpen && (
            <div className="animate-in fade-in-50 duration-300">
              <ProductForm
                initialData={editingProduct}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingProduct(null);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Search Table & Counts */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#8C7063]" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="ค้นหาในตารางสินค้า..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D9C8BE] text-xs text-[#4A3E3D] outline-none focus:border-[#C6A24D]"
              />
            </div>

            <span className="text-xs text-[#8C7063] self-end sm:self-auto font-medium">
              สินค้าทั้งหมดในคลัง: <strong>{products.length}</strong> รายการ
            </span>
          </div>

          {/* Products Table (Responsive Table) */}
          <div className="bg-white rounded-3xl border border-[#E8C5C8]/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#F2EBE1] text-[#8C7063] font-semibold">
                    <th className="py-3.5 px-4">รูปภาพ</th>
                    <th className="py-3.5 px-4">ชื่อกำไล & หิน</th>
                    <th className="py-3.5 px-4">ราคา</th>
                    <th className="py-3.5 px-4">สต็อก</th>
                    <th className="py-3.5 px-4">สไตล์</th>
                    <th className="py-3.5 px-4">ความมงคล (Intentions)</th>
                    <th className="py-3.5 px-4 text-right">จัดการ (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EBE1]">
                  {filteredInAdmin.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          onClick={() => onViewProduct(product.id)}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-[#E8C5C8]/40 cursor-pointer"
                        />
                      </td>

                      {/* Name & Stone */}
                      <td className="py-3 px-4 max-w-xs">
                        <div
                          onClick={() => onViewProduct(product.id)}
                          className="font-semibold text-[#3E2723] hover:text-[#8C5258] cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </div>
                        <div className="text-[11px] text-[#8C7063] flex items-center gap-1 mt-0.5">
                          <span>💎 {product.stone}</span>
                          <span>•</span>
                          <span>{product.beadSize || '3 มิล'}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-[#8C5258]">
                        ฿{product.price.toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            product.stock > 5
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {product.stock} เส้น
                        </span>
                      </td>

                      {/* Style */}
                      <td className="py-3 px-4 text-[#5C4D4A]">
                        {product.style}
                      </td>

                      {/* Intentions */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {product.intentions.slice(0, 2).map((int) => (
                            <span
                              key={int}
                              className="text-[10px] bg-[#FAF4ED] text-[#8C7063] px-1.5 py-0.5 rounded border border-[#E8C5C8]/30"
                            >
                              {int}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions (Update & Delete) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsFormOpen(true);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="p-1.5 rounded-lg text-[#8C7063] hover:text-[#C6A24D] hover:bg-[#FAF4ED] transition-colors"
                            title="แก้ไขข้อมูล (Update)"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 rounded-lg text-[#8C7063] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ลบสินค้า (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
