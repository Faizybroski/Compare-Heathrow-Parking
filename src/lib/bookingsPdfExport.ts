import { Booking } from "@/types";
import {
  formatDateTime,
  formatDayCount,
  formatPrice,
  getPaymentStatusLabel,
  getStatusLabel,
} from "@/lib/utils";

const BUSINESS_NAME =
  process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "ParkPro";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const e = (v: string | number | null | undefined): string =>
  escapeHtml(String(v ?? ""));

export interface BookingsPdfOptions {
  exportDate: string;
  statusFilter?: string;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  totalCount: number;
}

export function exportBookingsPdf(
  bookings: Booking[],
  options: BookingsPdfOptions,
): boolean {
  if (typeof window === "undefined") return false;

  const printWindow = window.open(
    "",
    `bookings-report-${Date.now()}`,
    "width=1200,height=900",
  );
  if (!printWindow) return false;

  const { exportDate, statusFilter, searchQuery, dateFrom, dateTo, totalCount } =
    options;

  const filterParts: string[] = [];
  if (statusFilter) filterParts.push(`Status: ${statusFilter}`);
  if (searchQuery) filterParts.push(`Search: "${searchQuery}"`);
  if (dateFrom || dateTo) {
    const from = dateFrom || "—";
    const to = dateTo || "—";
    filterParts.push(`Date range: ${from} to ${to}`);
  }
  const filterLine =
    filterParts.length > 0
      ? filterParts.join(" &nbsp;·&nbsp; ")
      : "No filters applied";

  const rows = bookings
    .map((b) => {
      const statusLabel = b.statusLabel ?? getStatusLabel(b.status);
      const paymentLabel = getPaymentStatusLabel(b.paymentStatus);
      const totalPrice = b.currentTotalPrice ?? b.totalPrice;
      return `
        <tr>
          <td class="mono">${e(b.trackingNumber)}</td>
          <td>${e(b.userName)}<br><span class="sub">${e(b.userEmail)}</span></td>
          <td>${e(b.carMake + " " + b.carModel)}<br><span class="sub mono">${e(b.carNumber)}</span></td>
          <td><span class="badge status-${e(b.status)}">${e(statusLabel)}</span></td>
          <td><span class="badge payment-${e(b.paymentStatus ?? "unknown")}">${e(paymentLabel)}</span></td>
          <td>${e(formatDateTime(b.bookedStartTime))}</td>
          <td>${e(formatDateTime(b.bookedEndTime))}</td>
          <td>${e(formatDayCount(b.bookedDays))}</td>
          <td class="amount">${e(formatPrice(totalPrice))}</td>
        </tr>`;
    })
    .join("");

  const emptyRow =
    bookings.length === 0
      ? `<tr><td colspan="9" class="empty">No bookings to display.</td></tr>`
      : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Bookings Report — ${e(BUSINESS_NAME)}</title>
    <style>
      @page { size: A4 landscape; margin: 12mm 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9pt;
        color: #111;
        background: #fff;
      }
      .header { margin-bottom: 14px; border-bottom: 2px solid #1a1a2e; padding-bottom: 10px; }
      .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
      .business-name { font-size: 17pt; font-weight: 700; color: #1a1a2e; letter-spacing: 0.02em; }
      .report-title { font-size: 10pt; color: #555; margin-top: 2px; }
      .meta { font-size: 8pt; color: #777; text-align: right; }
      .meta div { margin-top: 2px; }
      .filters {
        margin-top: 6px;
        font-size: 8pt;
        color: #444;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      th {
        background: #1a1a2e;
        color: #fff;
        padding: 6px 8px;
        text-align: left;
        font-size: 7.5pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      th.right { text-align: right; }
      td {
        padding: 5px 8px;
        border-bottom: 1px solid #ececec;
        font-size: 8pt;
        vertical-align: middle;
        line-height: 1.4;
      }
      tr:nth-child(even) td { background: #f9f9f9; }
      td.amount { text-align: right; font-weight: 600; }
      td.mono, .mono { font-family: "Courier New", Courier, monospace; }
      .sub { font-size: 7pt; color: #888; }
      .badge {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 7pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .status-upcoming  { background: #dbeafe; color: #1d4ed8; }
      .status-active    { background: #dcfce7; color: #15803d; }
      .status-completed { background: #f3f4f6; color: #374151; }
      .status-cancelled { background: #fee2e2; color: #dc2626; }
      .payment-paid             { background: #dcfce7; color: #15803d; }
      .payment-awaiting_payment { background: #fef9c3; color: #854d0e; }
      .payment-unknown          { background: #f3f4f6; color: #6b7280; }
      .empty { text-align: center; padding: 20px; color: #999; }
      .footer {
        margin-top: 12px;
        border-top: 1px solid #ddd;
        padding-top: 6px;
        display: flex;
        justify-content: space-between;
        font-size: 7.5pt;
        color: #aaa;
      }
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .footer { position: running(footer); }
      }
    </style>
    <script>
      window.addEventListener("load", function () {
        window.focus();
        window.print();
      });
    </script>
  </head>
  <body>
    <div class="header">
      <div class="header-top">
        <div>
          <div class="business-name">${e(BUSINESS_NAME)}</div>
          <div class="report-title">Bookings Report</div>
        </div>
        <div class="meta">
          <div><strong>Exported:</strong> ${e(exportDate)}</div>
          <div><strong>Total matching:</strong> ${e(String(totalCount))} booking${totalCount !== 1 ? "s" : ""}</div>
          <div><strong>Showing:</strong> ${e(String(bookings.length))}</div>
        </div>
      </div>
      <div class="filters">${filterLine}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Tracking #</th>
          <th>Customer</th>
          <th>Vehicle</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Drop-off</th>
          <th>Pick-up</th>
          <th>Days</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}${emptyRow}
      </tbody>
    </table>

    <div class="footer">
      <span>${e(BUSINESS_NAME)} · Bookings Report</span>
      <span>${e(exportDate)}</span>
    </div>
  </body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  return true;
}
