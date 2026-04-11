"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Layers,
  TrendingUp,
  Calculator,
  Save,
} from "lucide-react";

const DEFAULT_FIRST_TEN: number[] = [
  45.99, 50.99, 55.99, 58.99, 61.99, 67.99, 72.99, 77.99, 82.99, 87.99,
];
const DEFAULT_TIER2_INCREMENT = 3;
const DEFAULT_TIER3_INCREMENT = 2;

const PREVIEW_DAYS = [1, 2, 3, 5, 7, 10, 11, 15, 20, 25, 30, 31, 40, 60, 90];

function calcPrice(
  day: number,
  prices: number[],
  t2Inc: number,
  t3Inc: number,
): number {
  if (day <= 0) return 0;
  if (day <= 10) return prices[day - 1] ?? 0;
  const day10 = prices[9] ?? 0;
  if (day <= 30) return day10 + (day - 10) * t2Inc;
  const day30 = day10 + 20 * t2Inc;
  return day30 + (day - 30) * t3Inc;
}

function getTier(day: number): 1 | 2 | 3 {
  if (day <= 10) return 1;
  if (day <= 30) return 2;
  return 3;
}

const TIER_COLORS: Record<1 | 2 | 3, { badge: string; dot: string; row: string }> = {
  1: {
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    row: "bg-blue-50/50",
  },
  2: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    row: "bg-amber-50/50",
  },
  3: {
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    row: "bg-purple-50/50",
  },
};

// ── Inline number input ──────────────────────────────────────────────────────
function PriceInput({
  value,
  onChange,
  min = 0,
  step = 0.01,
  prefix = "£",
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-xl border overflow-hidden ${className}`}
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <span
        className="px-3 py-2 text-sm font-semibold select-none"
        style={{ color: "var(--muted-foreground)", borderRight: "1px solid var(--border)", background: "var(--muted)" }}
      >
        {prefix}
      </span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min, v));
        }}
        className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent outline-none"
        style={{ color: "var(--foreground)" }}
      />
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  iconBg,
  iconColor,
  tierLabel,
  tierLabelStyle,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  tierLabel: string;
  tierLabelStyle: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            {title}
          </h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierLabelStyle}`}>
            {tierLabel}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ── Price flow arrow ─────────────────────────────────────────────────────────
function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1 my-2">
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
        <ChevronDown className="h-3 w-3" />
        {label}
      </div>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

// ── Tier summary pill ────────────────────────────────────────────────────────
function TierSummaryRow({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-4 py-3"
      style={{ background: "var(--muted)", borderColor: "var(--border)" }}
    >
      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="text-right">
        <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
          {value}
        </span>
        {subValue && (
          <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [prices, setPrices] = useState<number[]>([...DEFAULT_FIRST_TEN]);
  const [tier2Inc, setTier2Inc] = useState(DEFAULT_TIER2_INCREMENT);
  const [tier3Inc, setTier3Inc] = useState(DEFAULT_TIER3_INCREMENT);

  // Price calculator state
  const [calcDays, setCalcDays] = useState(15);
  const calcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPricing();
        const d = res.data;
        if (Array.isArray(d.firstTenDayPrices) && d.firstTenDayPrices.length === 10) {
          setPrices(d.firstTenDayPrices);
        }
        if (typeof d.day11To30Increment === "number") setTier2Inc(d.day11To30Increment);
        if (typeof d.day31PlusIncrement === "number") setTier3Inc(d.day31PlusIncrement);
      } catch {
        setError("Failed to load pricing. Showing defaults.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Derived values
  const day10Price = prices[9] ?? 0;
  const day11Price = day10Price + tier2Inc;
  const day30Price = day10Price + 20 * tier2Inc;
  const day31Price = day30Price + tier3Inc;

  const calcResult = calcPrice(calcDays, prices, tier2Inc, tier3Inc);

  const handlePriceChange = (index: number, value: number) => {
    setSuccess(false);
    setError("");
    setPrices((prev) => {
      const next = [...prev];
      next[index] = Math.round(value * 100) / 100;
      return next;
    });
  };

  const validate = (): string | null => {
    if (prices.length !== 10) return "All 10 day prices are required.";
    if (prices.some((p) => p < 0)) return "Prices cannot be negative.";
    if (tier2Inc < 0) return "Tier 2 increment cannot be negative.";
    if (tier3Inc < 0) return "Tier 3 increment cannot be negative.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await api.updatePricing({
        firstTenDayPrices: prices.map((p) => Math.round(p * 100) / 100),
        day11To30Increment: Math.round(tier2Inc * 100) / 100,
        day31PlusIncrement: Math.round(tier3Inc * 100) / 100,
      });

      const d = res.data;
      if (Array.isArray(d.firstTenDayPrices) && d.firstTenDayPrices.length === 10) {
        setPrices(d.firstTenDayPrices);
      }
      if (typeof d.day11To30Increment === "number") setTier2Inc(d.day11To30Increment);
      if (typeof d.day31PlusIncrement === "number") setTier3Inc(d.day31PlusIncrement);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl space-y-4 animate-pulse">
        {[200, 180, 160, 260].map((h, i) => (
          <div
            key={i}
            className="rounded-2xl"
            style={{ height: h, background: "var(--border)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in pb-10">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Tiered Pricing Engine
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Days 1–10 are set individually. Days 11–30 and 31+ scale automatically
          from the previous tier using a configurable daily increment.
        </p>
      </div>

      {/* ── Tier legend ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {([
          { tier: 1, label: "Tier 1 · Days 1–10", style: TIER_COLORS[1] },
          { tier: 2, label: "Tier 2 · Days 11–30", style: TIER_COLORS[2] },
          { tier: 3, label: "Tier 3 · Day 31+", style: TIER_COLORS[3] },
        ] as const).map(({ tier, label, style }) => (
          <span
            key={tier}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${style.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Pricing configuration saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Info className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ══ TIER 1 ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <SectionHeader
          icon={<BadgeDollarSign className="h-5 w-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          tierLabel="Tier 1"
          tierLabelStyle={TIER_COLORS[1].badge}
          title="Days 1–10: Individual Prices"
          subtitle="Set the exact total price for each of the first 10 days. These are the prices customers will pay for short stays."
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {prices.slice(0, 10).map((price, i) => (
            <div key={i} className="space-y-1.5">
              <label
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span
                  className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${TIER_COLORS[1].badge}`}
                >
                  {i + 1}
                </span>
                Day {i + 1}
              </label>
              <PriceInput
                value={price}
                onChange={(v) => handlePriceChange(i, v)}
                min={0}
                step={0.01}
              />
            </div>
          ))}
        </div>

        {/* Day 10 summary */}
        <div
          className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 border"
          style={{ background: "var(--muted)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            <ChevronRight className="h-4 w-4" />
            Day 10 price (Tier 2 base reference)
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            {formatPrice(day10Price)}
          </span>
        </div>
      </div>

      {/* Flow connector */}
      <FlowArrow label="Tier 2 continues from Day 10 price" />

      {/* ══ TIER 2 ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <SectionHeader
          icon={<Layers className="h-5 w-5" />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          tierLabel="Tier 2"
          tierLabelStyle={TIER_COLORS[2].badge}
          title="Days 11–30: Incremental Pricing"
          subtitle="Each additional day past Day 10 adds a fixed increment to the Day 10 price."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Increment input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Daily increment (added per extra day)
            </label>
            <PriceInput
              value={tier2Inc}
              onChange={(v) => { setTier2Inc(v); setSuccess(false); setError(""); }}
              min={0}
              step={0.01}
              prefix="+"
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Formula: Day 10 price + (N − 10) × increment
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Price preview
            </p>
            <div className="space-y-2">
              <TierSummaryRow
                label="Day 11 (first day of Tier 2)"
                value={formatPrice(day11Price)}
                subValue={`${formatPrice(day10Price)} + ${formatPrice(tier2Inc)}`}
              />
              <TierSummaryRow
                label="Day 20"
                value={formatPrice(day10Price + 10 * tier2Inc)}
              />
              <TierSummaryRow
                label="Day 30 (last day of Tier 2)"
                value={formatPrice(day30Price)}
                subValue={`${formatPrice(day10Price)} + 20×${formatPrice(tier2Inc)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flow connector */}
      <FlowArrow label="Tier 3 continues from Day 30 price" />

      {/* ══ TIER 3 ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <SectionHeader
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          tierLabel="Tier 3"
          tierLabelStyle={TIER_COLORS[3].badge}
          title="Day 31+: Long-Stay Pricing"
          subtitle="Each additional day past Day 30 adds a smaller increment. Applies to all durations beyond 30 days with no upper limit."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Increment input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Daily increment (added per extra day)
            </label>
            <PriceInput
              value={tier3Inc}
              onChange={(v) => { setTier3Inc(v); setSuccess(false); setError(""); }}
              min={0}
              step={0.01}
              prefix="+"
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Formula: Day 30 price + (N − 30) × increment
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              Price preview
            </p>
            <div className="space-y-2">
              <TierSummaryRow
                label="Day 31 (first day of Tier 3)"
                value={formatPrice(day31Price)}
                subValue={`${formatPrice(day30Price)} + ${formatPrice(tier3Inc)}`}
              />
              <TierSummaryRow
                label="Day 40"
                value={formatPrice(day30Price + 10 * tier3Inc)}
              />
              <TierSummaryRow
                label="Day 60"
                value={formatPrice(day30Price + 30 * tier3Inc)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ PRICE CALCULATOR ════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Calculator className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
              Price Calculator
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Enter any number of days to instantly see the total booking price.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="flex items-center rounded-xl border overflow-hidden"
              style={{ background: "var(--muted)", borderColor: "var(--border)" }}
            >
              <span
                className="px-3 py-2.5 text-sm font-semibold"
                style={{ color: "var(--muted-foreground)", borderRight: "1px solid var(--border)", background: "var(--muted)" }}
              >
                Days
              </span>
              <input
                ref={calcRef}
                type="number"
                min={1}
                step={1}
                value={calcDays}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1) setCalcDays(v);
                }}
                className="w-24 px-3 py-2.5 text-sm bg-transparent outline-none font-medium"
                style={{ color: "var(--foreground)" }}
              />
            </div>
            <span style={{ color: "var(--muted-foreground)" }}>→</span>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-5 py-3"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                Total price for {calcDays} day{calcDays !== 1 ? "s" : ""}
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {formatPrice(calcResult)}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${TIER_COLORS[getTier(calcDays)].badge}`}
            >
              Tier {getTier(calcDays)}
            </span>
          </div>
        </div>
      </div>

      {/* ══ PRICE SCHEDULE ══════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <BadgeDollarSign className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
              Full Price Schedule
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Live preview of pricing at key milestones. Updates as you edit above.
            </p>
          </div>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}
          >
            <span>Duration</span>
            <span className="text-center">Tier</span>
            <span className="text-right">Total Price</span>
          </div>

          {/* Table rows */}
          {PREVIEW_DAYS.map((day, idx) => {
            const tier = getTier(day);
            const price = calcPrice(day, prices, tier2Inc, tier3Inc);
            const colors = TIER_COLORS[tier];
            const isFirst = idx === 0;
            return (
              <div
                key={day}
                className={`grid grid-cols-3 px-4 py-3 items-center transition-colors ${
                  !isFirst ? "border-t" : ""
                }`}
                style={{
                  borderColor: "var(--border)",
                  background:
                    idx % 2 === 0 ? "var(--card)" : "var(--muted)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${colors.dot}`} />
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {day} day{day !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
                  >
                    Tier {tier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {formatPrice(price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ SAVE BUTTON ═════════════════════════════════════════════════ */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Pricing Configuration
          </>
        )}
      </button>
    </div>
  );
}
