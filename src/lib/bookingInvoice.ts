import { Booking } from "@/types";
import {
  formatDateTime,
  formatDayCount,
  formatPrice,
  getPaymentStatusLabel,
  getStatusLabel,
} from "@/lib/utils";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildOptionalRow = (label: string, value?: string | null): string => {
  if (!value) {
    return "";
  }

  return `
    <div class="row">
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(value)}</span>
    </div>
  `;
};

export function printBookingInvoice(booking: Booking): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const printWindow = window.open(
    "",
    `booking-invoice-${booking.trackingNumber}`,
    "width=420,height=760",
  );

  if (!printWindow) {
    return false;
  }

  const statusLabel = booking.statusLabel ?? getStatusLabel(booking.status);
  const paymentStatusLabel = getPaymentStatusLabel(booking.paymentStatus);
  const invoiceDate = formatDateTime(new Date());
  const currentTotalPrice = booking.currentTotalPrice ?? booking.totalPrice;
  const pendingExtraDays = booking.uptimeDays ?? 0;
  const pendingExtraPrice = booking.uptimePrice ?? 0;
  const finalizedExtraDays = booking.overtimeDays ?? 0;
  const finalizedExtraPrice = booking.overtimePrice ?? 0;
  const extraDays =
    booking.lateChargeMode === "pending" ? pendingExtraDays : finalizedExtraDays;
  const extraPrice =
    booking.lateChargeMode === "pending" ? pendingExtraPrice : finalizedExtraPrice;
  const extraLabel =
    booking.lateChargeMode === "pending"
      ? "Estimated extra days"
      : "Extra days";

  const notes: string[] = [];

  if (booking.lateChargeMode === "pending" && extraPrice > 0) {
    notes.push("Extra payment is estimated until the admin completes pickup.");
  } else if (extraPrice > 0) {
    notes.push("Extra payment was added after late pickup.");
  }

  if (booking.paymentStatus !== "paid") {
    notes.push("Payment is not confirmed yet.");
  }

  const noteMarkup = notes.length
    ? notes.map((note) => `<div>${escapeHtml(note)}</div>`).join("")
    : "<div>No additional notes.</div>";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(booking.trackingNumber)}</title>
    <style>
      @page {
        size: 80mm auto;
        margin: 6mm;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #fff;
        color: #000;
        font-family: "Courier New", Courier, monospace;
        font-size: 12px;
        line-height: 1.45;
      }

      body {
        display: flex;
        justify-content: center;
      }

      .receipt {
        width: 80mm;
        max-width: 100%;
        padding: 8px 6px 14px;
      }

      .center {
        text-align: center;
      }

      .title {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .subtitle {
        margin-top: 2px;
        font-size: 11px;
      }

      .divider {
        margin: 10px 0;
        border-top: 1px dashed #000;
      }

      .section-title {
        margin: 8px 0 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        padding: 2px 0;
      }

      .row span:first-child {
        max-width: 46%;
      }

      .row span:last-child {
        max-width: 54%;
        text-align: right;
        word-break: break-word;
      }

      .summary {
        text-align: center;
        padding: 4px 0;
      }

      .total {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid #000;
        font-size: 14px;
        font-weight: 700;
      }

      .notes div + div {
        margin-top: 4px;
      }

      .footer {
        margin-top: 12px;
        text-align: center;
        font-size: 11px;
      }

      @media print {
        body {
          display: block;
        }

        .receipt {
          width: auto;
          padding: 0;
        }
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
    <div class="receipt">
      <div class="center">
        <div class="title">Heathrow Safe Parking</div>
        <div class="subtitle">Parking Booking Invoice</div>
      </div>

      <div class="divider"></div>

      <div class="row">
        <span>Invoice Date</span>
        <span>${escapeHtml(invoiceDate)}</span>
      </div>
      <div class="row">
        <span>Tracking No</span>
        <span>${escapeHtml(booking.trackingNumber)}</span>
      </div>
      <div class="row">
        <span>Customer</span>
        <span>${escapeHtml(booking.userName)}</span>
      </div>

      <div class="divider"></div>

      <div class="summary">
        <div>${escapeHtml(statusLabel.toUpperCase())}</div>
        <div>${escapeHtml(paymentStatusLabel.toUpperCase())}</div>
      </div>

      <div class="divider"></div>

      <div class="section-title">Booking</div>
      <div class="row">
        <span>Drop-off</span>
        <span>${escapeHtml(formatDateTime(booking.bookedStartTime))}</span>
      </div>
      <div class="row">
        <span>Pick-up</span>
        <span>${escapeHtml(formatDateTime(booking.bookedEndTime))}</span>
      </div>
      ${buildOptionalRow(
        "Actual Exit",
        booking.actualExitTime ? formatDateTime(booking.actualExitTime) : null,
      )}
      <div class="row">
        <span>Booked Days</span>
        <span>${escapeHtml(formatDayCount(booking.bookedDays))}</span>
      </div>
      ${
        extraDays > 0
          ? `<div class="row">
              <span>${escapeHtml(extraLabel)}</span>
              <span>${escapeHtml(formatDayCount(extraDays))}</span>
            </div>`
          : ""
      }

      <div class="divider"></div>

      <div class="section-title">Vehicle</div>
      <div class="row">
        <span>Car</span>
        <span>${escapeHtml(`${booking.carMake} ${booking.carModel}`)}</span>
      </div>
      <div class="row">
        <span>Reg No</span>
        <span>${escapeHtml(booking.carNumber)}</span>
      </div>
      <div class="row">
        <span>Color</span>
        <span>${escapeHtml(booking.carColor)}</span>
      </div>
      <div class="row">
        <span>Email</span>
        <span>${escapeHtml(booking.userEmail)}</span>
      </div>
      <div class="row">
        <span>Phone</span>
        <span>${escapeHtml(booking.userPhone)}</span>
      </div>

      ${
        booking.departureTerminal ||
        booking.departureFlightNo ||
        booking.arrivalTerminal ||
        booking.arrivalFlightNo
          ? `<div class="divider"></div>
             <div class="section-title">Flight</div>
             ${buildOptionalRow("Departure Terminal", booking.departureTerminal)}
             ${buildOptionalRow("Departure Flight", booking.departureFlightNo)}
             ${buildOptionalRow("Arrival Terminal", booking.arrivalTerminal)}
             ${buildOptionalRow("Arrival Flight", booking.arrivalFlightNo)}`
          : ""
      }

      <div class="divider"></div>

      <div class="section-title">Charges</div>
      <div class="row">
        <span>Booked Amount</span>
        <span>${escapeHtml(formatPrice(booking.price))}</span>
      </div>
      ${
        extraPrice > 0
          ? `<div class="row">
              <span>${escapeHtml(extraLabel)}</span>
              <span>${escapeHtml(formatPrice(extraPrice))}</span>
            </div>`
          : ""
      }
      <div class="row">
        <span>Payment</span>
        <span>${escapeHtml(paymentStatusLabel)}</span>
      </div>

      <div class="total">
        <span>Total</span>
        <span>${escapeHtml(formatPrice(currentTotalPrice))}</span>
      </div>

      <div class="divider"></div>

      <div class="section-title">Notes</div>
      <div class="notes">
        ${noteMarkup}
      </div>

      <div class="divider"></div>

      <div class="footer">
        Thank you for choosing Heathrow Safe Parking
      </div>
    </div>
  </body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  return true;
}
