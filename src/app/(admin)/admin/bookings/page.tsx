"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  Booking,
  BookingSelectionPayload,
  BookingStatus,
} from "@/types";
import {
  formatDateTime,
  formatDayCount,
  formatDuration,
  formatPrice,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { printBookingInvoice } from "@/lib/bookingInvoice";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Printer,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

const tabs = [
  { key: "", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "active", label: "Activated" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const pageSizeOptions = [10, 25, 50, 100];

const bookingStatusLabels: Record<BookingStatus, string> = {
  upcoming: "Upcoming",
  active: "Activated",
  completed: "Completed",
  cancelled: "Cancelled",
};

type StatusSelectOption = {
  value: BookingStatus;
  label: string;
  disabled?: boolean;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type DeleteDialogState =
  | {
      mode: "single";
      bookingId: string;
      label: string;
    }
  | {
      mode: "bulk";
      count: number;
    }
  | null;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [completionExitTime, setCompletionExitTime] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [exportMode, setExportMode] = useState<"selection" | "allMatching">(
    "selection",
  );
  const [exporting, setExporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const pageCheckboxRef = useRef<HTMLInputElement | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setAllMatchingSelected(false);
    setExcludedIds([]);
    setExportMode("selection");
  }, []);

  const showFeedback = useCallback((nextFeedback: FeedbackState) => {
    setFeedback(nextFeedback);
    window.setTimeout(() => {
      setFeedback((current) =>
        current?.message === nextFeedback?.message ? null : current,
      );
    }, 4500);
  }, []);

  const fetchBookings = useCallback(
    async (
      showLoader = true,
      overrides?: { page?: number; search?: string; limit?: number },
    ) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const effectivePage = overrides?.page ?? page;
        const effectiveSearch = overrides?.search ?? appliedSearch;
        const effectiveLimit = overrides?.limit ?? pageSize;
        const res = await api.getBookings({
          status: activeTab || undefined,
          page: effectivePage,
          limit: effectiveLimit,
          search: effectiveSearch || undefined,
        });

        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
        setSelectedBooking((current) => {
          if (!current) return null;
          return (
            res.data.bookings.find((booking) => booking._id === current._id) ??
            current
          );
        });
      } catch (err) {
        console.error(err);
        showFeedback({
          type: "error",
          message: "Failed to load bookings.",
        });
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [activeTab, appliedSearch, page, pageSize, showFeedback],
  );

  const fetchToggle = async () => {
    try {
      const res = await api.getBookingToggle();
      setBookingEnabled(res.data.bookingEnabled);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void fetchToggle();
  }, []);

  useEffect(() => {
    void fetchBookings();

    const intervalId = window.setInterval(() => {
      void fetchBookings(false);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchBookings]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const currentPageIds = useMemo(
    () => bookings.map((booking) => booking._id),
    [bookings],
  );

  const isBookingSelected = useCallback(
    (bookingId: string) =>
      allMatchingSelected
        ? !excludedIds.includes(bookingId)
        : selectedIds.includes(bookingId),
    [allMatchingSelected, excludedIds, selectedIds],
  );

  const selectedCount = allMatchingSelected
    ? Math.max(0, total - excludedIds.length)
    : selectedIds.length;

  const currentPageSelectedCount = currentPageIds.filter((id) =>
    isBookingSelected(id),
  ).length;
  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageSelectedCount === currentPageIds.length;
  const someCurrentPageSelected =
    currentPageSelectedCount > 0 && !allCurrentPageSelected;

  useEffect(() => {
    if (pageCheckboxRef.current) {
      pageCheckboxRef.current.indeterminate = someCurrentPageSelected;
    }
  }, [someCurrentPageSelected]);

  const selectedBookingIsPaid = selectedBooking?.paymentStatus === "paid";
  const selectedPaymentStatusLabel = getPaymentStatusLabel(
    selectedBooking?.paymentStatus,
  );
  const selectedBookingStatusOptions = selectedBooking
    ? getStatusSelectOptions(selectedBooking)
    : [];
  const selectedBookingStatusHint = selectedBooking
    ? getStatusSelectHint(selectedBooking)
    : null;
  const selectedBookingStatusLocked =
    !selectedBooking ||
    !selectedBookingStatusOptions.some(
      (option) => option.value !== selectedBooking.status && !option.disabled,
    );
  const selectedBookingUpdating =
    !!selectedBooking && updatingBookingId === selectedBooking._id;

  const selectionSummary = allMatchingSelected
    ? `All matching bookings selected (${selectedCount})`
    : `${selectedCount} booking${selectedCount === 1 ? "" : "s"} selected`;

  const canSelectEntireDataset =
    !allMatchingSelected &&
    total > currentPageIds.length &&
    allCurrentPageSelected;

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const nextSearch = search.trim();
    const nextSignature = `${activeTab}|${nextSearch}`;
    const currentSignature = `${activeTab}|${appliedSearch}`;

    if (nextSignature !== currentSignature) {
      clearSelection();
    }

    const shouldRefetchImmediately =
      page === 1 && nextSearch === appliedSearch;

    setAppliedSearch(nextSearch);
    setPage(1);

    if (shouldRefetchImmediately) {
      void fetchBookings(true, { page: 1, search: nextSearch });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: BookingStatus,
    exitTime?: string,
  ) => {
    setUpdatingBookingId(id);

    try {
      const actualExitTime =
        newStatus === "completed"
          ? exitTime
            ? new Date(exitTime).toISOString()
            : new Date().toISOString()
          : undefined;

      await api.updateBookingStatus(id, newStatus, actualExitTime);
      await fetchBookings(false);
      setSelectedBooking(null);
      showFeedback({
        type: "success",
        message: "Booking status updated.",
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update booking status.",
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleStatusSelectChange = (
    booking: Booking,
    nextStatus: string,
    exitTime?: string,
  ) => {
    const normalizedStatus = nextStatus as BookingStatus;
    if (normalizedStatus === booking.status) {
      return;
    }

    void handleStatusChange(booking._id, normalizedStatus, exitTime);
  };

  const handleToggle = async () => {
    setToggleLoading(true);
    try {
      const res = await api.setBookingToggle(!bookingEnabled);
      setBookingEnabled(res.data.bookingEnabled);
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(false);
    }
  };

  const toggleBookingSelection = (bookingId: string, checked: boolean) => {
    if (allMatchingSelected) {
      setExcludedIds((current) =>
        checked
          ? current.filter((id) => id !== bookingId)
          : Array.from(new Set([...current, bookingId])),
      );
      return;
    }

    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, bookingId]))
        : current.filter((id) => id !== bookingId),
    );
  };

  const toggleCurrentPageSelection = (checked: boolean) => {
    if (allMatchingSelected) {
      setExcludedIds((current) =>
        checked
          ? current.filter((id) => !currentPageIds.includes(id))
          : Array.from(new Set([...current, ...currentPageIds])),
      );
      return;
    }

    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, ...currentPageIds]))
        : current.filter((id) => !currentPageIds.includes(id)),
    );
  };

  const handleSelectAllMatching = () => {
    setAllMatchingSelected(true);
    setSelectedIds([]);
    setExcludedIds([]);
    setExportMode("selection");
  };

  const buildCurrentSelectionPayload = (): BookingSelectionPayload =>
    allMatchingSelected
        ? {
            selectionMode: "allMatching",
            status: activeTab ? (activeTab as BookingStatus) : undefined,
            search: appliedSearch || undefined,
            excludeIds: excludedIds,
          }
      : {
          selectionMode: "selected",
          ids: selectedIds,
        };

  const buildAllMatchingPayload = (): BookingSelectionPayload => ({
    selectionMode: "allMatching",
    status: activeTab ? (activeTab as BookingStatus) : undefined,
    search: appliedSearch || undefined,
    excludeIds: [],
  });

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const payload =
        exportMode === "selection"
          ? buildCurrentSelectionPayload()
          : buildAllMatchingPayload();
      const blob = await api.exportBookingsExcel(payload);

      downloadBlob(
        blob,
        `bookings-${exportMode === "selection" ? "selection" : "all"}-${Date.now()}.xlsx`,
      );
      showFeedback({
        type: "success",
        message:
          exportMode === "selection"
            ? "Selected bookings exported to Excel."
            : "All matching bookings exported to Excel.",
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to export bookings.",
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePrintInvoice = (booking: Booking) => {
    const opened = printBookingInvoice(booking);
    if (!opened) {
      console.error("Unable to open invoice print window");
    }
  };

  const openSingleDeleteDialog = (booking: Booking) => {
    setDeleteDialog({
      mode: "single",
      bookingId: booking._id,
      label: `${booking.userName} (${booking.trackingNumber})`,
    });
    setDeleteConfirmation("");
  };

  const openBulkDeleteDialog = () => {
    if (selectedCount === 0) {
      return;
    }

    setDeleteDialog({
      mode: "bulk",
      count: selectedCount,
    });
    setDeleteConfirmation("");
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialog(null);
    setDeleteConfirmation("");
  };

  const refreshAfterDelete = async (deletedCount: number) => {
    const nextTotal = Math.max(0, total - deletedCount);
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
    const nextPage = Math.min(page, nextTotalPages);

    if (nextPage !== page) {
      setPage(nextPage);
      return;
    }

    await fetchBookings(true, { page: nextPage, limit: pageSize });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) {
      return;
    }

    if (
      deleteDialog.mode === "bulk" &&
      deleteConfirmation.trim().toUpperCase() !== "DELETE"
    ) {
      return;
    }

    setDeleting(true);

    try {
      let deletedCount = 0;
      let deletedIds: string[] = [];

      if (deleteDialog.mode === "single") {
        await api.deleteBooking(deleteDialog.bookingId);
        deletedCount = 1;
        deletedIds = [deleteDialog.bookingId];
        setSelectedIds((current) =>
          current.filter((id) => id !== deleteDialog.bookingId),
        );
        setExcludedIds((current) =>
          current.filter((id) => id !== deleteDialog.bookingId),
        );

        if (selectedBooking?._id === deleteDialog.bookingId) {
          setSelectedBooking(null);
        }
      } else {
        const res = await api.bulkDeleteBookings(buildCurrentSelectionPayload());
        deletedCount = res.data.deletedCount;
        deletedIds = res.data.deletedIds;
        clearSelection();

        if (selectedBooking && deletedIds.includes(selectedBooking._id)) {
          setSelectedBooking(null);
        }
      }

      await refreshAfterDelete(deletedCount);
      setDeleteDialog(null);
      setDeleteConfirmation("");
      showFeedback({
        type: "success",
        message:
          deleteDialog.mode === "single"
            ? "Booking permanently deleted."
            : `${deletedCount} bookings permanently deleted.`,
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to delete bookings.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const goToPage = (value: string) => {
    const requestedPage = Math.min(
      totalPages,
      Math.max(1, parseInt(value, 10) || 1),
    );
    setPage(requestedPage);
    setPageInput(String(requestedPage));
  };

  const pageItems = getPageItems(page, totalPages);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Bookings
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            {total} total bookings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
            }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Export
            </span>
            <Select
              value={exportMode}
              onValueChange={(value) =>
                setExportMode(value as "selection" | "allMatching")
              }
            >
              <SelectTrigger className="h-8 min-w-44 rounded-lg bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="selection" disabled={selectedCount === 0}>
                  Selection ({selectedCount})
                </SelectItem>
                <SelectItem value="allMatching">
                  All matching ({total})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => void handleExport()}
            disabled={exporting || (exportMode === "selection" && selectedCount === 0)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:shadow-md disabled:opacity-50"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Excel
          </button>

          <button
            onClick={openBulkDeleteDialog}
            disabled={selectedCount === 0 || deleting}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div
        className="flex items-center justify-between rounded-2xl border p-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Accept New Bookings
          </p>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {bookingEnabled
              ? "Customers can currently book parking spaces."
              : "Booking is disabled and customers cannot make new reservations."}
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggleLoading}
          className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
            bookingEnabled
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {toggleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bookingEnabled ? (
            <ToggleRight className="h-5 w-5" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          {bookingEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div
        className="flex flex-wrap gap-1 rounded-xl p-1"
        style={{ background: "var(--muted)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              clearSelection();
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key ? "text-white shadow-sm" : ""
            }`}
            style={
              activeTab === tab.key
                ? { background: "var(--primary)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, tracking #, or car reg..."
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--primary)" }}
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              ref={pageCheckboxRef}
              type="checkbox"
              checked={allCurrentPageSelected}
              onChange={(e) => toggleCurrentPageSelection(e.target.checked)}
              disabled={bookings.length === 0}
              className="h-4 w-4 rounded border"
            />
            <span style={{ color: "var(--foreground)" }}>Select page</span>
          </label>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Page size
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 min-w-24 rounded-lg bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {selectionSummary}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {canSelectEntireDataset && (
              <button
                type="button"
                onClick={handleSelectAllMatching}
                className="font-semibold"
                style={{ color: "var(--primary)" }}
              >
                Select all {total} matching bookings
              </button>
            )}
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="font-semibold"
                style={{ color: "var(--muted-foreground)" }}
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: "var(--border)" }}
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="py-12 text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            No bookings found
          </div>
        ) : (
          bookings.map((booking) => {
            const statusLabel =
              booking.statusLabel ?? getStatusLabel(booking.status);
            const currentTotalPrice =
              booking.currentTotalPrice ?? booking.totalPrice;
            const uptimeDays = booking.uptimeDays ?? 0;
            const uptimePrice = booking.uptimePrice ?? 0;
            const paymentStatusLabel = getPaymentStatusLabel(
              booking.paymentStatus,
            );
            const statusOptions = getStatusSelectOptions(booking);
            const statusHint = getStatusSelectHint(booking);
            const statusLocked = !statusOptions.some(
              (option) => option.value !== booking.status && !option.disabled,
            );
            const isUpdatingThisBooking = updatingBookingId === booking._id;
            const isSelected = isBookingSelected(booking._id);

            return (
              <div
                key={booking._id}
                onClick={() => {
                  setSelectedBooking(booking);
                  setCompletionExitTime(new Date().toISOString().slice(0, 16));
                }}
                className="mb-3 flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-md"
                style={{
                  borderColor: isSelected ? "var(--primary)" : "var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      toggleBookingSelection(booking._id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border"
                    aria-label={`Select booking ${booking.trackingNumber}`}
                  />
                </div>

                <div className="grid flex-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr_0.9fr_1fr]">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-mono font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {booking.trackingNumber}
                    </p>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.userEmail}
                    </p>
                  </div>

                  <div>
                    <p>
                      {booking.carMake} {booking.carModel}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {booking.carNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs">
                      <span>{formatDateTime(booking.bookedStartTime)}</span>
                      <br />
                      <span>to</span>
                      <br />
                      <span>{formatDateTime(booking.bookedEndTime)}</span>
                    </p>
                    <p className="font-medium">
                      {formatDayCount(booking.bookedDays)}
                    </p>
                    {booking.isOvertimeRunning && uptimeDays > 0 && (
                      <p className="text-xs font-medium text-amber-600">
                        Extra {formatDayCount(uptimeDays)}
                      </p>
                    )}
                  </div>

                  <div className="text-left xl:text-right">
                    <p className="text-lg font-bold">
                      {formatPrice(currentTotalPrice)}
                    </p>
                    {booking.lateChargeMode === "pending" && uptimePrice > 0 && (
                      <p className="text-xs text-amber-600">
                        Extra payment +{formatPrice(uptimePrice)}
                      </p>
                    )}
                    {booking.lateChargeMode === "finalized" && uptimePrice > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Late exit already added
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs uppercase ${getStatusColor(booking.status)}`}
                      >
                        {statusLabel}
                      </Badge>
                      <Badge
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] uppercase ${getPaymentStatusColor(booking.paymentStatus)}`}
                      >
                        {paymentStatusLabel}
                      </Badge>
                    </div>

                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleStatusSelectChange(booking, value)
                        }
                        disabled={isUpdatingThisBooking || statusLocked}
                      >
                        <SelectTrigger className="h-9 w-full rounded-lg bg-background text-xs font-medium">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="end">
                          {statusOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isUpdatingThisBooking ? (
                      <p className="text-[11px] text-muted-foreground">
                        Saving status...
                      </p>
                    ) : statusHint ? (
                      <p className="text-[11px] text-amber-600">{statusHint}</p>
                    ) : null}

                    <div
                      className="flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handlePrintInvoice(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Invoice
                      </button>
                      <button
                        onClick={() => openSingleDeleteDialog(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:opacity-30"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {pageItems.map((item, index) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    page === item ? "text-white" : ""
                  }`}
                  style={
                    page === item
                      ? { background: "var(--primary)" }
                      : { color: "var(--foreground)" }
                  }
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:opacity-30"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--muted-foreground)" }}>Jump to</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-20 rounded-lg border px-3 py-2 text-sm"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={() => goToPage(pageInput)}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 animate-slide-up"
            style={{ background: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-xl"
                style={{ color: "var(--muted-foreground)" }}
              >
                x
              </button>
            </div>

            <div className="mb-4 text-center">
              <p
                className="text-2xl font-bold font-mono"
                style={{ color: "var(--primary)" }}
              >
                {selectedBooking.trackingNumber}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusColor(selectedBooking.status)}`}
                >
                  {selectedBooking.statusLabel ??
                    getStatusLabel(selectedBooking.status)}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}
                >
                  {selectedPaymentStatusLabel}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <Row label="Name" value={selectedBooking.userName} />
              <Row label="Email" value={selectedBooking.userEmail} />
              <Row label="Phone" value={selectedBooking.userPhone} />
              <Row
                label="Vehicle"
                value={`${selectedBooking.carMake} ${selectedBooking.carModel} (${selectedBooking.carColor})`}
              />
              <Row label="Registration" value={selectedBooking.carNumber} />
              <Row
                label="Drop-off"
                value={formatDateTime(selectedBooking.bookedStartTime)}
              />
              <Row
                label="Pick-up"
                value={formatDateTime(selectedBooking.bookedEndTime)}
              />
              {selectedBooking.actualExitTime && (
                <Row
                  label="Actual Exit"
                  value={formatDateTime(selectedBooking.actualExitTime)}
                />
              )}
              <Row
                label="Booked Days"
                value={formatDayCount(selectedBooking.bookedDays)}
              />
              <Row label="Payment Status" value={selectedPaymentStatusLabel} />
              <Row
                label="Booked Price"
                value={formatPrice(selectedBooking.price)}
              />
              {selectedBooking.status === "upcoming" &&
                !selectedBooking.canActivate && (
                  <Row
                    label="Activation"
                    value={`Available from ${formatDateTime(selectedBooking.bookedStartTime)}`}
                  />
                )}
              {selectedBooking.status === "active" &&
                !selectedBooking.isOvertimeRunning &&
                (selectedBooking.timeRemainingHours ?? 0) > 0 && (
                  <Row
                    label="Time Remaining"
                    value={formatDuration(
                      selectedBooking.timeRemainingHours ?? 0,
                    )}
                  />
                )}
              {(selectedBooking.uptimeDays ?? 0) > 0 && (
                <Row
                  label={
                    selectedBooking.lateChargeMode === "pending"
                      ? "Pending Extra Days"
                      : "Extra Days"
                  }
                  value={`${formatDayCount(
                    selectedBooking.uptimeDays ?? 0,
                  )} (+${formatPrice(selectedBooking.uptimePrice ?? 0)})`}
                />
              )}
              <div
                className="mt-3 border-t pt-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex justify-between">
                  <span
                    className="font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Total Price
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    {formatPrice(
                      selectedBooking.currentTotalPrice ??
                        selectedBooking.totalPrice,
                    )}
                  </span>
                </div>
                {selectedBooking.lateChargeMode === "pending" && (
                  <p className="mt-2 text-xs text-amber-600">
                    Extra day charges should be collected manually in cash at
                    pickup.
                  </p>
                )}
                {!selectedBookingIsPaid && (
                  <p className="mt-2 text-xs text-amber-600">
                    Booking actions stay locked until online payment is
                    confirmed.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedBooking)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium transition-all hover:shadow-sm"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => openSingleDeleteDialog(selectedBooking)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {selectedBooking.status === "active" && (
                <div>
                  <label
                    htmlFor="exitTime"
                    className="mb-1 block text-xs font-medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Actual Pick-up Date &amp; Time
                  </label>
                  <input
                    id="exitTime"
                    type="datetime-local"
                    value={completionExitTime}
                    onChange={(e) => setCompletionExitTime(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{
                      background: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label
                  className="block text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Booking Status
                </label>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) =>
                    handleStatusSelectChange(
                      selectedBooking,
                      value,
                      value === "completed" ? completionExitTime : undefined,
                    )
                  }
                  disabled={selectedBookingUpdating || selectedBookingStatusLocked}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                    <SelectValue placeholder="Select booking status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {selectedBookingStatusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBookingUpdating ? (
                  <p className="text-xs text-muted-foreground">
                    Saving status...
                  </p>
                ) : selectedBookingStatusHint ? (
                  <p className="text-xs text-amber-600">
                    {selectedBookingStatusHint}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={closeDeleteDialog}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {deleteDialog.mode === "single"
                    ? "Permanently delete this booking?"
                    : `Permanently delete ${deleteDialog.count} bookings?`}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {deleteDialog.mode === "single"
                    ? `${deleteDialog.label} will be removed from the database forever.`
                    : "This action permanently removes the selected bookings from the database and cannot be undone."}
                </p>
              </div>
            </div>

            {deleteDialog.mode === "bulk" && (
              <div className="mb-4 space-y-2">
                <label
                  className="block text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Type DELETE to confirm bulk deletion
                </label>
                <input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={deleting}
                className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                disabled={
                  deleting ||
                  (deleteDialog.mode === "bulk" &&
                    deleteConfirmation.trim().toUpperCase() !== "DELETE")
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusSelectOptions(booking: Booking): StatusSelectOption[] {
  const isPaid = booking.paymentStatus === "paid";

  switch (booking.status) {
    case "upcoming":
      return [
        {
          value: "upcoming",
          label: bookingStatusLabels.upcoming,
        },
        {
          value: "active",
          label: bookingStatusLabels.active,
          disabled: !booking.canActivate || !isPaid,
        },
        {
          value: "cancelled",
          label: bookingStatusLabels.cancelled,
        },
      ];
    case "active":
      return [
        {
          value: "active",
          label: bookingStatusLabels.active,
        },
        {
          value: "completed",
          label: bookingStatusLabels.completed,
          disabled: !isPaid,
        },
      ];
    case "completed":
      return [
        {
          value: "completed",
          label: bookingStatusLabels.completed,
        },
      ];
    case "cancelled":
      return [
        {
          value: "cancelled",
          label: bookingStatusLabels.cancelled,
        },
      ];
    default:
      return [
        {
          value: booking.status,
          label: booking.statusLabel ?? getStatusLabel(booking.status),
        },
      ];
  }
}

function getStatusSelectHint(booking: Booking): string | null {
  if (booking.status === "upcoming" && booking.paymentStatus !== "paid") {
    return "Activation is locked until payment is confirmed.";
  }

  if (booking.status === "upcoming" && !booking.canActivate) {
    return `Activate from ${formatDateTime(booking.bookedStartTime)}.`;
  }

  if (booking.status === "active" && booking.paymentStatus !== "paid") {
    return "Completion is locked until payment is confirmed.";
  }

  return null;
}

function getPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span
        className="text-right font-medium"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}
