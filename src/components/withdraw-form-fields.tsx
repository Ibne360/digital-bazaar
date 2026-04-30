"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import type { DepositMethodMeta } from "@/lib/constants";

interface WithdrawFormFieldsProps {
  walletBalance: number;
  minUsd: number;
  rate: number; // BDT per USD
  methods: DepositMethodMeta[];
}

/**
 * Two coupled inputs (amount + method) that live-preview BDT equivalent
 * when a BDT-based payout method is selected.
 */
export function WithdrawFormFields({
  walletBalance,
  minUsd,
  rate,
  methods,
}: WithdrawFormFieldsProps) {
  const [amount, setAmount] = useState<string>(
    String(Math.min(walletBalance, 10)),
  );
  const [methodId, setMethodId] = useState<string>(methods[0]?.id ?? "");

  const num = Number(amount);
  const usd = Number.isFinite(num) && num > 0 ? num : 0;
  const meta = methods.find((m) => m.id === methodId);
  const isBdtPayout = meta?.payCurrency === "BDT";
  const bdt = Math.round(usd * rate * 100) / 100;
  const validAmount = usd >= minUsd && usd <= walletBalance;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={minUsd}
            max={walletBalance}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Min ${minUsd.toFixed(2)} · Max ${walletBalance.toFixed(2)} (your
          balance).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Method</Label>
        <Select
          id="method"
          name="method"
          required
          value={methodId}
          onChange={(e) => setMethodId(e.target.value)}
        >
          {methods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} ({m.type})
            </option>
          ))}
        </Select>
      </div>

      {isBdtPayout && validAmount ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Conversion rate
            </span>
            <span className="text-xs font-mono font-semibold">
              $1.00 = ৳{rate}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-border/60 pt-1.5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              You will receive
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              ৳{bdt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
