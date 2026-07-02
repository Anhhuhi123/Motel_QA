/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomStatus, DepositStatus, BillStatus } from "./types";

/**
 * Formats a number into Vietnamese Dong (VND) with standard formatting.
 * E.g., 5000000 -> 5.000.000 ₫
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Display labels in Vietnamese for internal (English) enum values.
// Enum values themselves stay in English to remain compatible with the database schema.
const roomStatusLabels: Record<RoomStatus, string> = {
  Occupied: "Đã thuê",
  Available: "Còn trống",
  Maintenance: "Bảo trì",
};

export function roomStatusLabel(status: RoomStatus): string {
  return roomStatusLabels[status] || status;
}

const depositStatusLabels: Record<DepositStatus, string> = {
  Paid: "Đã đặt cọc",
  Partial: "Cọc một phần",
  Overdue: "Quá hạn cọc",
};

export function depositStatusLabel(status: DepositStatus): string {
  return depositStatusLabels[status] || status;
}

const billStatusLabels: Record<BillStatus, string> = {
  Paid: "Đã thanh toán",
  Pending: "Chờ thanh toán",
  Unpaid: "Chưa thanh toán",
};

export function billStatusLabel(status: BillStatus): string {
  return billStatusLabels[status] || status;
}

// Builds a Vietnamese "Tháng M/YYYY" label for a given date, used consistently
// for bill generation and dashboard chart aggregation so the two stay in sync.
export function formatMonthLabel(date: Date): string {
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Converts an <input type="month"> value ("YYYY-MM") into the "Tháng M/YYYY"
// label used for bill.month, so quick bills can be backdated to past months.
export function monthInputToLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return `Tháng ${month}/${year}`;
}

// Formats the current date as an <input type="month"> value ("YYYY-MM").
export function currentMonthInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
