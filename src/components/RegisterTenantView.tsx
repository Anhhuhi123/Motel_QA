/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  ArrowLeft, 
  UserPlus, 
  FileSignature, 
  Sparkles, 
  CheckCircle,
  Building,
  DollarSign,
  FileText
} from "lucide-react";
import { Room, Tenant, DepositStatus } from "../types";
import { formatVND } from "../utils";

interface RegisterTenantViewProps {
  rooms: Room[];
  onRegister: (tenantData: Omit<Tenant, "id">) => void;
  onNavigate: (view: string) => void;
}

export default function RegisterTenantView({ 
  rooms, 
  onRegister, 
  onNavigate 
}: RegisterTenantViewProps) {
  // Available rooms for dropdown mapping
  const availableRooms = rooms.filter(r => r.status === "Available" || r.status === "Occupied");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dob, setDob] = useState("2000-01-01");
  const [gender, setGender] = useState("Nam (Male)");
  const [occupation, setOccupation] = useState("Kỹ Sư (Engineer)");

  const [selectedRoomNumber, setSelectedRoomNumber] = useState(
    availableRooms[0]?.number || ""
  );
  const [contractStart, setContractStart] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [depositStatus, setDepositStatus] = useState<DepositStatus>("Paid");
  
  // Agreement Template inclusions
  const [incRentalAg, setIncRentalAg] = useState(true);
  const [incResidenceAg, setIncResidenceAg] = useState(true);
  const [incHandoverAg, setIncHandoverAg] = useState(true);

  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !idNumber) return;

    // Trigger state callback with form parameters
    onRegister({
      name: fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@propria-tenant.net`,
      nationalId: idNumber,
      phone: phone,
      roomAssignment: `Room ${selectedRoomNumber}`,
      contractStart: contractStart,
      depositStatus: depositStatus,
      occupation: occupation,
      gender: gender,
      dob: dob
    });

    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      onNavigate("tenants"); // Dynamic navigation redirect after 2s
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Upper navigation header bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate("tenants")}
          className="p-2 border border-[#c6c6cd] rounded-lg hover:border-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Register New Tenant</h2>
          <p className="text-xs text-[#45464d] mt-1">Bind rooms, register identities, and prepare digital agreements</p>
        </div>
      </div>

      {showSuccessAnim ? (
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-12 text-center shadow-xl space-y-4 animate-scale-up">
          <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-black font-display">Tenant Bind Registration Complete!</h3>
          <p className="text-xs text-[#45464d] max-w-sm mx-auto">
            Room status was automatically flagged as <span className="font-bold">Occupied</span>. Digital agreement is stored in active system repository.
          </p>
          <div className="pt-2 text-slate-400 text-[11px] flex justify-center items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Redirecting to Tenants Ledger...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Tenant Personal Details (Bên B) */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#c6c6cd]/50 bg-slate-50/50 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0051d5]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider font-display">Section 1: Tenant Information (Bên Thuê - Bên B)</h3>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Full Name (Họ và Tên) *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alice Johnson" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2.5 focus:ring-1 focus:ring-black outline-none font-semibold text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">National ID / Citizen Identity (Số CCCD / CMND) *</label>
                  <input 
                    type="text" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 037095034... or ID-X" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2.5 focus:ring-1 focus:ring-black outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Phone Number (Số Điện Thoại) *</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-0192" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 focus:ring-1 focus:ring-black outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@example.com" 
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Date of Birth (Ngày Sinh)</label>
                  <input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Gender (Giới Tính)</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 focus:ring-1 focus:ring-black cursor-pointer bg-white"
                  >
                    <option>Nam (Male)</option>
                    <option>Nữ (Female)</option>
                    <option>Khác (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Occupation (Nghề nghiệp)</label>
                  <input 
                    type="text" 
                    value={occupation} 
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Room assignment & Deposit Setup */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#c6c6cd]/50 bg-slate-50/50 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0051d5]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider font-display">Section 2: Leasehold & Utility Config (Điều khoản & Dịch vụ)</h3>
            </div>

            <div className="p-6 space-y-4 text-xs text-black">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Assign Room *</label>
                  <select 
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2.5 focus:ring-1 focus:ring-black cursor-pointer bg-white font-bold"
                    required
                  >
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.number}>
                        Room {r.number} - {r.name} ({formatVND(r.monthlyRent)}/tháng)
                      </option>
                    ))}
                    {availableRooms.length === 0 && (
                      <option>No available rooms matching</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Contract Commencement Date</label>
                  <input 
                    type="date" 
                    value={contractStart} 
                    onChange={(e) => setContractStart(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2.5 focus:ring-1 focus:ring-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#45464d] mb-1">Security Deposit Status</label>
                  <select 
                    value={depositStatus}
                    onChange={(e) => setDepositStatus(e.target.value as DepositStatus)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2.5 focus:ring-1 focus:ring-black cursor-pointer bg-white"
                  >
                    <option value="Paid">Fully Paid ({formatVND(10000000)})</option>
                    <option value="Partial">Partial Deposit Paid</option>
                    <option value="Overdue">Overdue / Awaiting Deposit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Document Generator Preview template */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#c6c6cd]/50 bg-slate-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0051d5]" />
              <h3 className="text-xs font-bold text-black uppercase tracking-wider font-display">Section 3: Agreement Template Generation Flow</h3>
            </div>

            <div className="p-6 space-y-4 text-xs text-black">
              <p className="text-[#45464d]">
                Toggle which official templates you want the system to generate and digitally sign for this leaseholder binder:
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 bg-[#f7f9fb] p-3 rounded-lg border border-[#c6c6cd]/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={incRentalAg} 
                    onChange={(e) => setIncRentalAg(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-[#c6c6cd] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black">Bilingual Apartment Lease Agreement (Hợp Đồng Thuê Nhà)</span>
                    <p className="text-[10px] text-[#45464d] mt-0.5">Complies with standard Vietnamese Ministry guidelines. Binds room rate to signature.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#f7f9fb] p-3 rounded-lg border border-[#c6c6cd]/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={incResidenceAg} 
                    onChange={(e) => setIncResidenceAg(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-[#c6c6cd] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black">Temporary Residence Registration (Khai Báo Tạm Trú)</span>
                    <p className="text-[10px] text-[#45464d] mt-0.5">Pre-fills tenant and national ID card markers for municipal reporting.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#f7f9fb] p-3 rounded-lg border border-[#c6c6cd]/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={incHandoverAg} 
                    onChange={(e) => setIncHandoverAg(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-[#c6c6cd] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black">Asset Handover Checklist (Biên Bản Bàn Giao Thiết Bị)</span>
                    <p className="text-[10px] text-[#45464d] mt-0.5">Generates clean physical inventory log list for room entry audit.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={() => onNavigate("tenants")}
              className="flex-1 border border-[#c6c6cd] py-3 rounded-lg text-xs font-bold text-[#45464d] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-black text-white hover:bg-slate-800 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <FileSignature className="w-4 h-4" />
              <span>Confirm & Generate Bind Contract</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
