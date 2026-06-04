/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  FileText, 
  Sparkles, 
  Search, 
  Settings, 
  Wrench, 
  ChevronRight, 
  Eye, 
  FolderOpen, 
  Edit2, 
  CheckCircle, 
  Info, 
  Save, 
  Activity,
  UserCheck
} from "lucide-react";
import { DocumentTemplate, UtilitySettings, ActivityLog } from "../types";
import { formatVND } from "../utils";

interface TemplatesViewProps {
  templates: DocumentTemplate[];
  utilitySettings: UtilitySettings;
  activityLogs: ActivityLog[];
  onUpdateUtilitySettings: (settings: UtilitySettings) => void;
  onNavigate: (view: string) => void;
}

export default function TemplatesView({ 
  templates = [], 
  utilitySettings, 
  activityLogs = [],
  onUpdateUtilitySettings,
  onNavigate 
}: TemplatesViewProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "parameters" | "audit">("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable settings inputs
  const [elecPrice, setElecPrice] = useState(utilitySettings.electricityPrice);
  const [waterPrice, setWaterPrice] = useState(utilitySettings.waterPrice);
  const [internetFee, setInternetFee] = useState(utilitySettings.internetFee);
  const [garbageFee, setGarbageFee] = useState(utilitySettings.garbageFee);
  const [parkingFee, setParkingFee] = useState(utilitySettings.parkingFee);
  const [autoSync, setAutoSync] = useState(utilitySettings.autoSync);

  // Sync state if prop changes
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    onUpdateUtilitySettings({
      electricityPrice: Number(elecPrice),
      waterPrice: Number(waterPrice),
      internetFee: Number(internetFee),
      garbageFee: Number(garbageFee),
      parkingFee: Number(parkingFee),
      otherFee: 0,
      autoSync: autoSync
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === "All" || 
      t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <section className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-black tracking-tight font-display">Templates & System Configuration</h2>
        <p className="text-sm text-[#45464d]">Configure document flows, billing coefficients, and inspect system audit logs.</p>
      </section>

      {/* Tabs list switches */}
      <div className="flex border-b border-[#c6c6cd]">
        <button 
          onClick={() => setActiveTab("templates")}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 hover:text-[#0051d5] uppercase tracking-wide cursor-pointer ${
            activeTab === "templates" 
              ? "border-black text-black" 
              : "border-transparent text-[#45464d]"
          }`}
        >
          Document Templates
        </button>
        <button 
          onClick={() => setActiveTab("parameters")}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 hover:text-[#0051d5] uppercase tracking-wide cursor-pointer ${
            activeTab === "parameters" 
              ? "border-black text-black" 
              : "border-transparent text-[#45464d]"
          }`}
        >
          Utility Prices & Parameters
        </button>
        <button 
          onClick={() => setActiveTab("audit")}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 hover:text-[#0051d5] uppercase tracking-wide cursor-pointer ${
            activeTab === "audit" 
              ? "border-black text-black" 
              : "border-transparent text-[#45464d]"
          }`}
        >
          System Audit Logs
        </button>
      </div>

      {/* TAB CONTAINER 1: Document templates flow */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-base font-bold text-black font-display">Automated Document Workflows</h3>
            
            <div className="flex gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-[#c6c6cd] rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <option>All</option>
                <option>Rental</option>
                <option>Residence</option>
                <option>Handover</option>
              </select>

              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full bg-white border border-[#c6c6cd] rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTemplates.map((t) => (
              <div 
                key={t.id} 
                className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-2xs hover:border-[#0051d5] transition-all flex flex-col justify-between"
              >
                {/* Visual placeholder mapping details from UI spec */}
                {t.id === "temp-rental" ? (
                  <div className="h-32 bg-slate-100 relative">
                    <img 
                      alt="Modern workspace interior" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHdvyGke_2P3ZfwEIdrAhyV4AoxUnJUkyOp1-g4nIV2f08wbxA9FofJUYOGnLjSISHzKJDasOnz-f11XGxtrsWRZIbpCEybblH8z6YrZ7RuyGbRSR6vpsDdgzTktwuw-vNKgrEtwDbp7gQMrhcaicToPOQuWoD6Gya9RYgr30L36vcWjLqEgxR0pg721GqHhpzfnVDwd6mJYQxq40PRXHfkAbDMLML8JpKNL_JCm0cPXXUX66LJk6m6unjFi-XwjRR1BxHienpaWQ"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Bilingual Active
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-[#eceef0]/60 flex items-center justify-center border-b border-[#c6c6cd]/50">
                    <FileText className="w-10 h-10 text-[#76777d]" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-[#0051d5] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {t.category} Flow
                      </span>
                    </div>
                    <h4 className="font-bold text-black text-xs font-display mb-1.5 leading-snug">{t.name}</h4>
                    <p className="text-[10px] text-[#45464d] leading-relaxed">{t.description}</p>
                  </div>

                  <div className="flex gap-2 mt-5 border-t pt-3">
                    <button className="flex-1 border border-[#c6c6cd] hover:border-black text-[10px] font-bold py-2 rounded text-[#45464d] hover:text-black">
                      Edit File
                    </button>
                    <button 
                      onClick={() => onNavigate("register")}
                      className="flex-1 bg-black text-white hover:bg-slate-700 text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1"
                    >
                      <span>Assign Tenant</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTAINER 2: Utility Price Coefficients / Parameters */}
      {activeTab === "parameters" && (
        <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden max-w-xl shadow-xs">
          <div className="p-5 border-b border-[#c6c6cd] bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-black font-display">Global Utility Price Parameters</h3>
              <p className="text-xs text-[#45464d]">These are automatically applied when calculating monthly tenant bills</p>
            </div>
            <Settings className="w-5 h-5 text-[#76777d]" />
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-5 text-xs text-black">
            {saveSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-3 rounded-r-lg flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Coefficients saved successfully! Dynamic calculator updated.</span>
              </div>
            )}

            {/* Input fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#45464d] mb-1">Electricity Price (VND per kWh) *</label>
                <input 
                  type="text" 
                  value={elecPrice}
                  onChange={(e) => setElecPrice(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2.5 font-semibold font-mono focus:ring-1 focus:ring-black outline-none"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Average user consumes 150 - 300kWh</p>
              </div>
              <div>
                <label className="block font-bold text-[#45464d] mb-1">Water Rate (VND per m³) *</label>
                <input 
                  type="text" 
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2.5 font-semibold font-mono focus:ring-1 focus:ring-black outline-none"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Calculated via m³ smart volumetric metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#45464d] mb-1">Internet Fee (VND per month)</label>
                <input 
                  type="text" 
                  value={internetFee}
                  onChange={(e) => setInternetFee(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 font-semibold font-mono focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#45464d] mb-1">Garbage Disposal (VND)</label>
                <input 
                  type="text" 
                  value={garbageFee}
                  onChange={(e) => setGarbageFee(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 font-semibold font-mono focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#45464d] mb-1">Parking Fee (VND per vehicle)</label>
                <input 
                  type="text" 
                  value={parkingFee}
                  onChange={(e) => setParkingFee(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 font-semibold font-mono focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="autoSync"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-black border-[#c6c6cd] cursor-pointer"
                />
                <label htmlFor="autoSync" className="font-semibold text-black cursor-pointer">
                  Auto-synchronize on contract creation
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border flex gap-2 text-[11px] leading-relaxed text-[#45464d]">
              <Info className="w-5 h-5 text-[#0051d5] shrink-0 mt-0.5" />
              <span>Prices entered here determine calculations in the billing overview and represent real landlord service configurations.</span>
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white hover:bg-slate-800 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing Parameters</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTAINER 3: Audit System Log Lists */}
      {activeTab === "audit" && (
        <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#c6c6cd] bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-black font-display">System Audit Logs</h3>
              <p className="text-xs text-[#45464d]">A chronological ledger of admin actions and transaction statuses</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="divide-y divide-[#c6c6cd]/40">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-purple-50/10 transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    log.type === "payment" 
                      ? "bg-emerald-50 text-emerald-600" 
                      : log.type === "maintenance" 
                        ? "bg-orange-50 text-orange-600" 
                        : "bg-blue-50 text-blue-600"
                  }`}>
                    {log.user.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-black font-semibold">
                      <span className="font-bold">{log.user}</span> {log.action} <span className="font-bold text-slate-700">{log.detail}</span>
                    </p>
                    <p className="text-[10px] text-[#45464d] mt-1 font-mono">{log.timeLabel} · API Verified</p>
                  </div>
                </div>
                
                {log.amount ? (
                  <span className="font-mono font-bold text-emerald-700">
                    +{formatVND(log.amount)}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#45464d] italic font-semibold">SysLog</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
