"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { BUSINESSES, BusinessConfig } from "@/lib/businesses";
import { CheckCircle2, Save, Loader2 } from "lucide-react";

const TERMINALS = ["T2", "T3", "T4", "T5"] as const;
type Terminal = (typeof TERMINALS)[number];

const realBusinesses = BUSINESSES.filter((b) => b.businessId !== null) as (BusinessConfig & {
  businessId: string;
})[];

type BizState = {
  messages: Record<Terminal, string>;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

const emptyMessages = (): Record<Terminal, string> =>
  Object.fromEntries(TERMINALS.map((t) => [t, ""])) as Record<Terminal, string>;

export default function SettingsPage() {
  const [bizState, setBizState] = useState<Record<string, BizState>>(() =>
    Object.fromEntries(
      realBusinesses.map((b) => [
        b.businessId,
        { messages: emptyMessages(), loading: true, saving: false, saved: false, error: null },
      ]),
    ),
  );

  const fetchMessages = useCallback(async () => {
    await Promise.allSettled(
      realBusinesses.map(async (b) => {
        try {
          const res = await api.getTerminalMessages(b.businessId);
          const raw = res.data.messages ?? {};
          const messages = emptyMessages();
          TERMINALS.forEach((t) => {
            messages[t] = raw[t] ?? "";
          });
          setBizState((prev) => ({
            ...prev,
            [b.businessId]: { ...prev[b.businessId], messages, loading: false, error: null },
          }));
        } catch {
          setBizState((prev) => ({
            ...prev,
            [b.businessId]: {
              ...prev[b.businessId],
              loading: false,
              error: "Failed to load messages",
            },
          }));
        }
      }),
    );
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleChange = (businessId: string, terminal: Terminal, value: string) => {
    setBizState((prev) => ({
      ...prev,
      [businessId]: {
        ...prev[businessId],
        messages: { ...prev[businessId].messages, [terminal]: value },
        saved: false,
      },
    }));
  };

  const handleSave = async (businessId: string) => {
    setBizState((prev) => ({
      ...prev,
      [businessId]: { ...prev[businessId], saving: true, error: null, saved: false },
    }));
    try {
      // Only send terminals that have content; omit empty ones to keep DB clean
      const toSave: Record<string, string> = {};
      TERMINALS.forEach((t) => {
        const v = bizState[businessId].messages[t].trim();
        if (v) toSave[t] = v;
      });
      await api.updateTerminalMessages(toSave, businessId);
      setBizState((prev) => ({
        ...prev,
        [businessId]: { ...prev[businessId], saving: false, saved: true },
      }));
      setTimeout(() => {
        setBizState((prev) => ({
          ...prev,
          [businessId]: { ...prev[businessId], saved: false },
        }));
      }, 3000);
    } catch (err) {
      setBizState((prev) => ({
        ...prev,
        [businessId]: {
          ...prev[businessId],
          saving: false,
          error: err instanceof Error ? err.message : "Save failed",
        },
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Terminal Messages
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Set per-terminal instructions for each business. When a customer selects a terminal at
          booking, this message is included in their confirmation email.
        </p>
      </div>

      <div className="space-y-6">
        {realBusinesses.map((biz) => {
          const state = bizState[biz.businessId];

          return (
            <div
              key={biz.businessId}
              className="rounded-2xl border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              {/* Business header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${biz.bg ?? "bg-gray-100"}`}
                  >
                    <Image
                      src={biz.img}
                      alt={biz.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      {biz.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {biz.distance} · {biz.type}
                    </p>
                  </div>
                </div>

                <button
                  disabled={state?.saving || state?.loading}
                  onClick={() => handleSave(biz.businessId)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white disabled:opacity-50 transition-all hover:opacity-90"
                >
                  {state?.saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : state?.saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>

              {/* Terminal message inputs */}
              <div className="p-5">
                {state?.error && (
                  <p className="text-sm text-red-500 mb-4">{state.error}</p>
                )}

                {state?.loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TERMINALS.map((t) => (
                      <div
                        key={t}
                        className="h-28 rounded-xl animate-pulse"
                        style={{ background: "var(--border)" }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TERMINALS.map((terminal) => (
                      <div key={terminal} className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {terminal}
                        </label>
                        <textarea
                          rows={4}
                          value={state?.messages[terminal] ?? ""}
                          onChange={(e) =>
                            handleChange(biz.businessId, terminal, e.target.value)
                          }
                          placeholder={`Instructions for ${terminal} customers…`}
                          className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                          style={{
                            background: "var(--muted)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
                  Leave a terminal blank to send no special instructions for that terminal.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
