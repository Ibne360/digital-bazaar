"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";

interface DepositAmountInputProps {
  payCurrency: "BDT" | "USD";
  rate: number; // BDT per USD
  minBdt: number;
  minUsd: number;
  defaultValue?: number;
}

/**
 * Amount input that shows a live conversion preview.
 *  - BDT methods: user types BDT, we preview USD wallet credit.
 *  - USD methods: user types USD directly (no conversion).
 */
export function DepositAmountInput({
  payCurrency,
  rate,
  minBdt,
  minUsd,
  defaultValue,
}: DepositAmountInputProps) {
  const [value, setValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : "",
  );

  const num = Number(value);
  const safe = Number.isFinite(num) && num > 0 ? num : 0;

  const isBdt = payCurrency === "BDT";
  const min = isBdt ? minBdt : minUsd;
  const symbol = isBdt ? "৳" : "$";

  const convertedUsd = isBdt ? Math.round((safe / rate) * 100) / 100 : safe;
  const showPreview = safe >= min;

  return (
    <div className="space-y-2">
      <Label htmlFor="amount">
        Amount ({isBdt ? "BDT — Bangladeshi Taka" : "USD — US Dollar"})
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
          {symbol}
        </span>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={min}
          step={isBdt ? "1" : "0.01"}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-8"
          placeholder={isBdt ? `Min ৳${minBdt}` : `Min $${minUsd.toFixed(2)}`}
        />
      </div>

      {isBdt ? (
        <div
          className={`rounded-lg border p-3 text-sm transition-colors ${
            showPreview
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-dashed border-border bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Conversion rate
            </span>
            <span className="text-xs font-mono font-semibold">
              ৳{rate} = $1.00
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-border/60 pt-1.5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Wallet credit
            </span>
            <span
              className={`text-lg font-bold ${
                showPreview ? "text-emerald-700 dark:text-emerald-300" : ""
              }`}
            >
              ${convertedUsd.toFixed(2)}
            </span>
          </div>
          {!showPreview ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Minimum deposit ৳{minBdt} (≈ ${minUsd.toFixed(2)}).
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Wallet credit: <span className="font-semibold">${safe.toFixed(2)}</span>
          {" · "}Minimum ${minUsd.toFixed(2)}.
        </p>
      )}
    </div>
  );
}
