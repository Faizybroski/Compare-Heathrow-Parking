import {
  ApiResponse,
  Booking,
  BookingSelectionPayload,
  DashboardStats,
  PaginatedResponse,
  PriceCalculation,
  PricingBreakdown,
  PricingConfig,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID || "69c58c8616860ff720b40e4c";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    overrideBusinessId?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "X-Business-Id": overrideBusinessId ?? BUSINESS_ID,
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("text/csv")) {
      return (await res.text()) as unknown as T;
    }

    if (
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ) ||
      contentType.includes("application/octet-stream")
    ) {
      return (await res.blob()) as unknown as T;
    }

    return res.json();
  }

  // ── Public booking endpoints ───────────────────────────────────────

  async getBookingStatus(): Promise<ApiResponse<{ bookingEnabled: boolean }>> {
    return this.request("/bookings/status");
  }

  async createBooking(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<Booking>> {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createCheckoutSession(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ checkoutUrl: string; trackingNumber: string }>> {
    return this.request("/payments/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /** Same as createCheckoutSession but for a specific business (overrides BUSINESS_ID). */
  async createCheckoutSessionForBusiness(
    businessId: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ checkoutUrl: string; trackingNumber: string }>> {
    const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
      method: "POST",
      headers: {
        "X-Business-Id": businessId,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ ...data, bookedVia: "heathrowcompare" }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async getBookingBySession(sessionId: string): Promise<ApiResponse<Booking>> {
    return this.request(`/payments/session/${sessionId}`);
  }

  async getStartingDayPrice(): Promise<ApiResponse<number>> {
    return this.request("/bookings/pricePerHour");
  }

  async trackBooking(trackingNumber: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${trackingNumber}`);
  }

  /**
   * Track a booking from the compare site — searches both real businesses
   * (ParkPro then Heathrow Safe Parking) and returns whichever finds it.
   */
  async trackBookingForCompare(trackingNumber: string): Promise<ApiResponse<Booking>> {
    const realBusinessIds = ["69c58c8616860ff720b40e4c", "69d3f081f2245d52c5927d3d", "69e0c88358667024ac151f2e"];
    let lastError: Error = new Error("Booking not found");
    for (const bid of realBusinessIds) {
      try {
        const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(trackingNumber)}`, {
          headers: { "X-Business-Id": bid, "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          return res.json();
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError;
  }

  async calculatePrice(
    startTime: string,
    endTime: string,
  ): Promise<ApiResponse<PriceCalculation>> {
    return this.request(
      `/bookings/price?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    );
  }

  // ── Auth ───────────────────────────────────────────────────────────

  async login(
    email: string,
    password: string,
  ): Promise<
    ApiResponse<{ token: string; admin: { name: string; email: string } }>
  > {
    return this.request("/compare/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request("/compare/logout", { method: "POST" });
  }

  async getProfile(): Promise<ApiResponse<{ _id: string; name: string; email: string }>> {
    return this.request("/compare/profile");
  }

  // ── Admin endpoints ────────────────────────────────────────────────

  async getDashboard(businessId?: string): Promise<ApiResponse<DashboardStats>> {
    return this.request("/compare/dashboard", {}, businessId);
  }

  async getBookings(
    params: {
      status?: string;
      page?: number;
      limit?: number;
      search?: string;
    dateFrom?: string;
    dateTo?: string;
    },
    businessId?: string,
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set("status", params.status);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) searchParams.set("dateTo", params.dateTo);
    return this.request(`/compare/bookings?${searchParams.toString()}`, {}, businessId);
  }

  async updateBookingStatus(
    id: string,
    status: string,
    actualExitTime?: string,
    businessId?: string,
  ): Promise<ApiResponse<Booking>> {
    return this.request(
      `/compare/bookings/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status, actualExitTime }) },
      businessId,
    );
  }

  async exportBookingsExcel(data: BookingSelectionPayload, businessId?: string): Promise<Blob> {
    return this.request("/compare/bookings/export", {
      method: "POST",
      body: JSON.stringify(data),
    }, businessId);
  }

  async deleteBooking(id: string, businessId?: string): Promise<ApiResponse<{ id: string }>> {
    return this.request(`/compare/bookings/${id}`, { method: "DELETE" }, businessId);
  }

  async bulkDeleteBookings(
    data: BookingSelectionPayload,
    businessId?: string,
  ): Promise<ApiResponse<{ deletedCount: number; deletedIds: string[] }>> {
    return this.request("/compare/bookings/bulk-delete", {
      method: "POST",
      body: JSON.stringify(data),
    }, businessId);
  }

  async getBookingToggle(businessId?: string): Promise<ApiResponse<{ bookingEnabled: boolean }>> {
    return this.request("/compare/booking-toggle", {}, businessId);
  }

  async setBookingToggle(
    bookingEnabled: boolean,
    businessId?: string,
  ): Promise<ApiResponse<{ bookingEnabled: boolean }>> {
    return this.request("/compare/booking-toggle", {
      method: "PATCH",
      body: JSON.stringify({ bookingEnabled }),
    }, businessId);
  }

  async getTerminalMessages(businessId?: string): Promise<ApiResponse<{ messages: Record<string, string> }>> {
    return this.request("/compare/terminal-messages", {}, businessId);
  }

  async updateTerminalMessages(
    messages: Record<string, string>,
    businessId?: string,
  ): Promise<ApiResponse<{ messages: Record<string, string> }>> {
    return this.request("/compare/terminal-messages", {
      method: "PATCH",
      body: JSON.stringify({ messages }),
    }, businessId);
  }

  async getPricing(): Promise<ApiResponse<PricingConfig>> {
    return this.request("/compare/pricing");
  }

  async updatePricing(data: {
    firstTenDayPrices: number[];
    day11To30Increment: number;
    day31PlusIncrement: number;
  }): Promise<ApiResponse<PricingConfig>> {
    return this.request("/compare/pricing", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPricingBreakdown(days: number): Promise<ApiResponse<PricingBreakdown>> {
    return this.request(`/bookings/pricing?days=${days}`);
  }

  async contact(data: { name: string; email: string; message: string }) {
    // Use the compare site's own email config for contact form submissions.
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: {
        "X-Business-Id": "compare",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
