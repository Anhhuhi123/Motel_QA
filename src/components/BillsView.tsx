/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Coins, 
  ArrowRight, 
  HelpCircle, 
  Sparkles,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  TrendingDown
} from "lucide-react";
import { Bill, BillStatus, Room, UtilitySettings } from "../types";
import { formatVND } from "../utils";

interface BillsViewProps {
  bills: Bill[];
  rooms: Room[];
  utilitySettings: UtilitySettings;
  searchQuery: string;
  onGenerateBills: () => void;
  onMarkBillPaid: (billId: string) => void;
  onSendNotice: (billId: string) => void;
}

export default function BillsView({ 
  bills = [], 
  rooms = [],
  utilitySettings,
  searchQuery: headerSearchQuery,
  onGenerateBills,
  onMarkBillPaid,
  onSendNotice
}: BillsViewProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const activeSearch = headerSearchQuery || localSearch;

  // Unique months for filter
  const uniqueMonths = Array.from(new Set(bills.map(b => b.month)));

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = 
      (bill.room?.toLowerCase() || '').includes(activeSearch.toLowerCase()) ||
      (bill.month?.toLowerCase() || '').includes(activeSearch.toLowerCase());

    const matchesStatus = 
      statusFilter === "All Status" || 
      bill.status === statusFilter;

    const matchesMonth = 
      monthFilter === "All Months" || 
      bill.month === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Pagination setups
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  const outstandingSum = bills
    .filter(b => b.status === "Unpaid" || b.status === "Pending")
    .reduce((sum, b) => sum + b.total, 0);

  const collectedSum = bills
    .filter(b => b.status === "Paid")
    .reduce((sum, b) => sum + b.total, 0);

  const utilitiesTotal = bills
    .reduce((sum, b) => sum + b.electricity + b.water, 0);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateBills();
      setIsGenerating(false);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3000);
    }, 1200);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setStatusFilter("All Status");
    setMonthFilter("All Months");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header with interactive simulator generate trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Bills</h2>
          <p className="text-sm text-[#45464d] mt-1">Generate and track rental and utility services receipts</p>
        </div>
        <div className="flex gap-2">
          {generationSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 animate-scale-up">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Smart billing completed!</span>
            </div>
          )}
          <button 
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${
              isGenerating 
                ? "bg-slate-400 text-white cursor-wait" 
                : "bg-black text-white hover:bg-slate-800 active:scale-95 cursor-pointer"
            }`}
          >
            <Sparkles className={`w-4 h-4 text-emerald-400 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Calculating..." : "Generate Monthly Bills"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Header Indicators from description image mock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-2xs">
          <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider">Total Outstanding</p>
          <p className="text-3xl font-bold text-red-600 font-display mt-1">{formatVND(outstandingSum)}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Awaiting tenant deposit transfers</span>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-2xs">
          <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider">Collected This Month</p>
          <p className="text-3xl font-bold text-emerald-600 font-display mt-1">{formatVND(collectedSum)}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>94.2% Collection completion index</span>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-2xs">
          <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider">Water & Electricity Total</p>
          <p className="text-3xl font-bold text-black font-display mt-1">{formatVND(utilitiesTotal)}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Calculated from utility settings rates</span>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-2xs">
        <div className="flex-grow min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] w-4 h-4" />
          <input 
            type="text"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search bills by Room number or code..."
            className="w-full bg-[#f2f4f6] border border-transparent rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Month selectors */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Month:</label>
          <select 
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>All Months</option>
            {uniqueMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-[#45464d] uppercase tracking-wider">Status:</label>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#f2f4f6] border border-transparent hover:border-[#c6c6cd] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option>All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {/* Clear Filter link */}
        {(localSearch || statusFilter !== "All Status" || monthFilter !== "All Months") && (
          <button 
            onClick={handleClearFilters}
            className="text-[#0051d5] text-xs font-bold hover:underline px-2 cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Primary Bills List */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#c6c6cd]/50 bg-slate-50/50">
          <h3 className="text-sm font-bold text-black font-display">All bills of managed rooms</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Room</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Billing Month</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Electricity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Water</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Rent Fee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#45464d] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/30">
              {paginatedBills.length > 0 ? (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-black border border-[#c6c6cd] px-2 py-0.5 rounded-md bg-[#eceef0]">
                        {bill.room}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#45464d] font-bold font-mono">
                      {bill.month}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black">
                      {formatVND(bill.electricity)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black">
                      {formatVND(bill.water)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black">
                      {formatVND(bill.rent)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-black">
                      {formatVND(bill.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        bill.status === "Paid" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : bill.status === "Pending" 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        <span className={`w-1 h-1 rounded-full mr-1 ${
                          bill.status === "Paid" 
                            ? "bg-emerald-500" 
                            : bill.status === "Pending" 
                              ? "bg-amber-500" 
                              : "bg-red-500"
                        }`} />
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {bill.status !== "Paid" && (
                          <button 
                            onClick={() => onMarkBillPaid(bill.id)}
                            className="bg-[#0051d5] hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedBill(bill)}
                          title="View Billing Breakdown"
                          className="p-1 text-slate-400 hover:text-black hover:bg-slate-50 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onSendNotice(bill.id)}
                          title="Resend Notice Notification email to Tenant"
                          className="p-1 text-slate-400 hover:text-[#0051d5] hover:bg-blue-50 rounded"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-xs text-[#76777d] font-semibold">
                    No billing statements detected with chosen parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination footer */}
        <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#c6c6cd]/50 flex items-center justify-between">
          <span className="text-xs text-[#45464d] font-semibold">
            Showing {filteredBills.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredBills.length)} of {filteredBills.length} statements
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

      {/* Bill Breakdown details modal overlay */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-white border border-[#c6c6cd] rounded-xl max-w-sm w-full p-6 shadow-2xl relative animate-scale-up">
            <button 
              onClick={() => setSelectedBill(null)}
              className="absolute top-4 right-4 text-[#45464d] hover:text-black cursor-pointer bg-[#eceef0]/80 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b pb-3 border-[#c6c6cd]/50">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-black font-display uppercase tracking-wider">Statement Calculator</h3>
            </div>

            <div className="space-y-4 text-xs text-black">
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#45464d] font-semibold">Target Room:</span>
                <span className="font-bold text-[#0051d5] bg-blue-50 px-2 py-0.5 rounded-md text-[10px]">{selectedBill.room}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#45464d] font-semibold">Billing Period:</span>
                <span className="font-bold font-mono">{selectedBill.month}</span>
              </div>

              {/* Formula calculations mapping */}
              <div className="space-y-2 pt-2 bg-[#f7f9fb] p-3 rounded-lg border">
                <div className="flex justify-between text-[11px] font-semibold border-b border-dashed pb-1.5 mb-1 text-slate-500 uppercase tracking-wide">
                  <span>Parameter</span>
                  <span>Formula Breakdown</span>
                  <span>Subtotal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Base Rent:</span>
                  <span className="text-[#76777d] italic">Fixed lease rent</span>
                  <span className="font-bold font-mono">{formatVND(selectedBill.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Electricity:</span>
                  <span className="text-[#76777d] italic">units used · {formatVND(utilitySettings.electricityPrice)}/kWh</span>
                  <span className="font-bold font-mono">{formatVND(selectedBill.electricity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Water:</span>
                  <span className="text-[#76777d] italic">m³ volume · {formatVND(utilitySettings.waterPrice)}/m³</span>
                  <span className="font-bold font-mono">{formatVND(selectedBill.water)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Servicing Fees:</span>
                  <span className="text-[#76777d] italic">Internet + Trash + Parking</span>
                  <span className="font-bold font-mono">
                    {formatVND(utilitySettings.internetFee + utilitySettings.garbageFee + utilitySettings.parkingFee)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-baseline border-t-2 border-double border-[#c6c6cd]/50">
                <span className="font-bold text-sm text-black">Total Amount:</span>
                <span className="text-lg font-bold font-mono text-black">{formatVND(selectedBill.total)}</span>
              </div>

              {/* Status details */}
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border">
                <span className="text-[#45464d] font-bold">Transaction state:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                  selectedBill.status === "Paid" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : selectedBill.status === "Pending" 
                      ? "bg-amber-50 text-amber-700 border-amber-100" 
                      : "bg-red-50 text-red-700 border-red-100"
                }`}>
                  {selectedBill.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setSelectedBill(null)}
                className="w-full bg-black text-white hover:bg-slate-800 text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
              >
                Acknowledge Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
