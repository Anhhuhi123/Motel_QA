/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  UserPlus,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  IdCard,
  X
} from "lucide-react";
import { Tenant, Room } from "../types";
import { formatVND, depositStatusLabel } from "../utils";
import { supabase } from "../lib/supabaseClient";

interface TenantsViewProps {
  tenants: Tenant[];
  rooms?: Room[];
  searchQuery: string;
  onRemoveTenant: (tenantId: string) => void;
  onNavigate: (view: string) => void;
}

export default function TenantsView({
  tenants = [],
  rooms = [],
  searchQuery: headerSearchQuery,
  onRemoveTenant,
  onNavigate
}: TenantsViewProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [depositFilter, setDepositFilter] = useState("Tất cả trạng thái");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContractTenant, setSelectedContractTenant] = useState<Tenant | null>(null);
  const [lessor, setLessor] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      setLessor({
        fullName: profile?.full_name || user.email || "Quản trị viên",
        role: profile?.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : "Quản Lý Nhà Trọ"
      });
    });
    return () => { cancelled = true; };
  }, []);

  const activeSearch = headerSearchQuery || localSearch;

  // Filter strategies
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      (tenant.name?.toLowerCase() || '').includes(activeSearch.toLowerCase()) ||
      (tenant.email?.toLowerCase() || '').includes(activeSearch.toLowerCase()) ||
      (tenant.phone || '').includes(activeSearch) ||
      (tenant.nationalId || '').includes(activeSearch) ||
      (tenant.roomAssignment?.toLowerCase() || '').includes(activeSearch.toLowerCase());

    const matchesDeposit =
      depositFilter === "Tất cả trạng thái" ||
      tenant.depositStatus === depositFilter;

    return matchesSearch && matchesDeposit;
  });

  // Pagination setups
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setLocalSearch("");
    setDepositFilter("Tất cả trạng thái");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Người Thuê</h2>
          <p className="text-sm text-[#45464d] mt-1">Tổng cộng {tenants.length} người thuê đang được quản lý</p>
        </div>
        <button
          onClick={() => onNavigate("register")}
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Người Thuê</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-2xs">
        <div className="flex-grow min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm theo tên, số điện thoại, CCCD hoặc phòng..."
            className="w-full bg-[#f2f4f6] border border-transparent rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Deposit Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Trạng thái cọc:</label>
          <select
            value={depositFilter}
            onChange={(e) => { setDepositFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>Tất cả trạng thái</option>
            <option value="Paid">Đã đặt cọc</option>
            <option value="Partial">Cọc một phần</option>
            <option value="Overdue">Quá hạn cọc</option>
          </select>
        </div>

        {/* Clear triggers */}
        {(localSearch || depositFilter !== "Tất cả trạng thái") && (
          <button
            onClick={handleClearFilters}
            className="text-[#0051d5] text-xs font-bold hover:underline px-2 cursor-pointer"
          >
            Xóa Bộ Lọc
          </button>
        )}
      </div>

      {/* Main Tenant Table list */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        {/* Mobile Card List — replaces the table below md so no data is hidden behind horizontal scroll */}
        <div className="md:hidden divide-y divide-[#c6c6cd]/30">
          {paginatedTenants.length > 0 ? (
            paginatedTenants.map((tenant) => (
              <div key={tenant.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {tenant.avatarUrl ? (
                    <img
                      alt={`${tenant.name} avatar`}
                      src={tenant.avatarUrl}
                      className="w-10 h-10 rounded-full object-cover border border-[#c6c6cd] shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200 shrink-0">
                      {(tenant.name || 'U').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-black truncate">{tenant.name}</p>
                    <p className="text-[10px] text-[#45464d] mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#76777d] shrink-0" />
                      <span className="truncate">{tenant.email}</span>
                    </p>
                  </div>
                  <span className={`ml-auto shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    tenant.depositStatus === "Paid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : tenant.depositStatus === "Partial"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-red-50 text-red-700 border-red-100"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      tenant.depositStatus === "Paid"
                        ? "bg-emerald-500"
                        : tenant.depositStatus === "Partial"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`} />
                    {depositStatusLabel(tenant.depositStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <p className="text-black font-semibold flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-[#76777d] shrink-0" />
                    <span>{tenant.phone}</span>
                  </p>
                  <p className="text-[#45464d] flex items-center gap-1.5 font-mono">
                    <IdCard className="w-3 h-3 text-[#76777d] shrink-0" />
                    <span>{tenant.nationalId}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#45464d] font-semibold">Phòng</span>
                  <span className="text-xs font-bold text-black border border-[#c6c6cd] px-2 py-0.5 rounded-md bg-[#f2f4f6]">
                    {tenant.roomAssignment}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#45464d] font-semibold">Ngày Bắt Đầu Hợp Đồng</span>
                  <span className="font-mono font-bold text-black">{tenant.contractStart}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#c6c6cd]/50">
                  <button
                    onClick={() => setSelectedContractTenant(tenant)}
                    className="flex-1 px-2 py-1.5 bg-black text-white hover:bg-slate-800 rounded font-bold text-[10px] inline-flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Xem Hợp Đồng</span>
                  </button>
                  <button
                    onClick={() => onRemoveTenant(tenant.id)}
                    title="Xóa hoặc chấm dứt hợp đồng người thuê"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
              Không tìm thấy người thuê phù hợp với bộ lọc đã chọn.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Tên Người Thuê</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Liên Hệ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Phòng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Ngày Bắt Đầu Hợp Đồng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Trạng Thái Cọc</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/30">
              {paginatedTenants.length > 0 ? (
                paginatedTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                    {/* Tenant Profile Name and email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {tenant.avatarUrl ? (
                          <img
                            alt={`${tenant.name} avatar`}
                            src={tenant.avatarUrl}
                            className="w-10 h-10 rounded-full object-cover border border-[#c6c6cd] shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                            {(tenant.name || 'U').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-black">{tenant.name}</p>
                          <p className="text-[10px] text-[#45464d] mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#76777d]" />
                            <span>{tenant.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contacts: Phone and National ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <p className="text-xs text-black font-semibold flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-[#76777d]" />
                          <span>{tenant.phone}</span>
                        </p>
                        <p className="text-[10px] text-[#45464d] flex items-center gap-1.5 font-mono">
                          <IdCard className="w-3 h-3 text-[#76777d]" />
                          <span>CCCD: {tenant.nationalId}</span>
                        </p>
                      </div>
                    </td>

                    {/* Room design category */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black border border-[#c6c6cd] px-2 py-0.5 rounded-md bg-[#f2f4f6]">
                          {tenant.roomAssignment}
                        </span>
                      </div>
                    </td>

                    {/* Lease Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-black font-semibold font-mono">
                      {tenant.contractStart}
                    </td>

                    {/* Deposit badging */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        tenant.depositStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : tenant.depositStatus === "Partial"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          tenant.depositStatus === "Paid"
                            ? "bg-emerald-500"
                            : tenant.depositStatus === "Partial"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`} />
                        {depositStatusLabel(tenant.depositStatus)}
                      </span>
                    </td>

                    {/* Actions button grids */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedContractTenant(tenant)}
                          className="px-2 py-1 bg-black text-white hover:bg-slate-800 rounded font-bold text-[10px] inline-flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem Hợp Đồng</span>
                        </button>
                        <button
                          onClick={() => onRemoveTenant(tenant.id)}
                          title="Xóa hoặc chấm dứt hợp đồng người thuê"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
                    Không tìm thấy người thuê phù hợp với bộ lọc đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#c6c6cd]/50 flex items-center justify-between">
          <span className="text-xs text-[#45464d] font-semibold">
            Hiển thị {filteredTenants.length > 0 ? startIndex + 1 : 0} đến {Math.min(startIndex + itemsPerPage, filteredTenants.length)} trong {filteredTenants.length} người thuê
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg border border-[#c6c6cd] bg-white text-xs text-[#45464d] hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  currentPage === idx + 1
                    ? "bg-black text-white"
                    : "text-[#45464d] hover:bg-white"
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg border border-[#c6c6cd] bg-white text-xs text-[#45464d] hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contract Agreement Viewer Dialog overlay */}
      {selectedContractTenant && createPortal(
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-scale-up">
            <button
              onClick={() => setSelectedContractTenant(null)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black cursor-pointer bg-[#eceef0]/80 p-1 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header styled following Vietnam Standards */}
            <div className="text-center mb-8 border-b pb-6 border-slate-200">
              <h3 className="text-sm font-bold text-black uppercase leading-tight tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
              <p className="text-[11px] font-bold text-slate-700 tracking-wide mt-1">Độc lập - Tự do - Hạnh phúc</p>
              <h4 className="text-base font-bold text-black uppercase tracking-wider mt-4">HỢP ĐỒNG THUÊ PHÒNG TRỌ</h4>
              <p className="text-xs text-slate-500 font-semibold italic">Hệ thống quản lý nhà trọ Propria</p>
            </div>

            {/* Contract specifications body details */}
            <div className="space-y-6 text-xs text-black leading-relaxed">
              <p className="font-semibold text-slate-700 border-l-2 border-black pl-2">
                Hôm nay ngày {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}, chúng tôi gồm có:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f7f9fb] p-4 rounded-lg border border-[#c6c6cd]/50">
                <div>
                  <p className="font-bold text-[#0051d5] border-b pb-1 mb-2 uppercase text-[10px] tracking-wider">Bên A - Bên Cho Thuê</p>
                  <p className="font-semibold">Ông/Bà đại diện: <span className="font-bold text-black">{lessor?.fullName || "..."}</span></p>
                  <p className="mt-1 text-[#45464d]">Chức vụ: {lessor?.role || "Quản Lý Nhà Trọ"}</p>
                </div>
                <div>
                  <p className="font-bold text-[#0051d5] border-b pb-1 mb-2 uppercase text-[10px] tracking-wider">Bên B - Bên Thuê</p>
                  <p className="font-semibold">Ông/Bà: <span className="font-bold text-black">{selectedContractTenant.name}</span></p>
                  <p className="mt-1 font-mono text-[#45464d]">Số CCCD/CMND: {selectedContractTenant.nationalId}</p>
                  <p className="font-mono text-[#45464d]">Số điện thoại: {selectedContractTenant.phone}</p>
                  <p className="text-[#45464d]">Email: {selectedContractTenant.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-black">Điều 1: Mục đích & Giá thuê</p>
                <ul className="list-disc pl-5 space-y-1 text-[#45464d]">
                  <li>Bên A đồng ý cho Bên B thuê phòng mã số: <span className="font-bold text-black">{selectedContractTenant.roomAssignment}</span></li>
                  <li>Giá thuê phòng cố định: <span className="font-bold text-black">
                    {formatVND(
                      rooms?.find(r => selectedContractTenant.roomAssignment === `Room ${r.number}`)?.monthlyRent || 0
                    )} / tháng
                  </span></li>
                  <li>Ngày bắt đầu hợp đồng: <span className="font-bold text-black font-mono">{selectedContractTenant.contractStart}</span></li>
                  <li>Trạng thái đặt cọc: <span className="font-bold text-emerald-600 uppercase font-mono">{depositStatusLabel(selectedContractTenant.depositStatus)}</span></li>
                </ul>
              </div>

              <div className="space-y-2">
              </div>
            </div>

            <div className="mt-8 flex gap-3 border-t pt-4">
              <button
                onClick={() => setSelectedContractTenant(null)}
                className="flex-1 bg-black text-white hover:bg-slate-800 text-xs font-bold py-2.5 rounded-lg active:scale-95 transition-all text-center cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
