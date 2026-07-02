/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { CheckCircle, User } from "lucide-react";
import { UtilitySettings } from "../types";

interface AccountSettingsViewProps {
  utilitySettings: UtilitySettings;
  onUpdateUtilitySettings: (updates: UtilitySettings) => void;
}

export default function AccountSettingsView({
  utilitySettings,
  onUpdateUtilitySettings
}: AccountSettingsViewProps) {
  const [formState, setFormState] = useState<UtilitySettings>(utilitySettings);
  const [savedRecently, setSavedRecently] = useState(false);

  useEffect(() => {
    setFormState(utilitySettings);
  }, [utilitySettings]);

  const handleSave = () => {
    onUpdateUtilitySettings(formState);
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight font-display">Tài Khoản</h2>
          <p className="text-sm text-[#45464d] mt-1">Cấu hình giá tiện ích mặc định dùng khi lập hóa đơn</p>
        </div>
      </div>

      <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-2xs max-w-2xl">
        <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">Giá Tiện Ích Mặc Định</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Đơn Giá Điện / kWh</label>
            <input
              type="number"
              value={formState.electricityPrice}
              onChange={(e) => setFormState({ ...formState, electricityPrice: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Nước (Cố Định/Tháng)</label>
            <input
              type="number"
              value={formState.waterPrice}
              onChange={(e) => setFormState({ ...formState, waterPrice: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Wifi / Tháng</label>
            <input
              type="number"
              value={formState.internetFee}
              onChange={(e) => setFormState({ ...formState, internetFee: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Rác / Tháng</label>
            <input
              type="number"
              value={formState.garbageFee}
              onChange={(e) => setFormState({ ...formState, garbageFee: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Gửi Xe / Tháng</label>
            <input
              type="number"
              value={formState.parkingFee}
              onChange={(e) => setFormState({ ...formState, parkingFee: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">Phí Khác / Tháng</label>
            <input
              type="number"
              value={formState.otherFee}
              onChange={(e) => setFormState({ ...formState, otherFee: Number(e.target.value) })}
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0051d5] outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formState.autoSync}
            onChange={(e) => setFormState({ ...formState, autoSync: e.target.checked })}
            className="w-4 h-4 rounded border-[#c6c6cd] cursor-pointer"
          />
          <span className="text-xs font-bold text-[#45464d]">Tự động đồng bộ giá tiện ích mới nhất</span>
        </label>

        <div className="pt-6 mt-6 border-t border-[#c6c6cd] flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Lưu Cài Đặt
          </button>
          {savedRecently && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 animate-scale-up">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Đã lưu cài đặt!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
