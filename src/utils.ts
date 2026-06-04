/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
