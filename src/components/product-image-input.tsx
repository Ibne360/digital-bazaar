"use client";

import { useState } from "react";
import { ImageOff, ImagePlus } from "lucide-react";
import { Input, Label } from "@/components/ui/input";

interface ProductImageInputProps {
  defaultValue?: string;
}

/**
 * Admin product image URL field with live preview.
 * Uses a plain <img> so any HTTPS host works without next.config tweaks.
 */
export function ProductImageInput({ defaultValue }: ProductImageInputProps) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [errored, setErrored] = useState(false);

  const showPreview = url.trim().length > 0 && !errored;

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUrl">Product image URL (optional)</Label>
      <Input
        id="imageUrl"
        name="imageUrl"
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setErrored(false);
        }}
        placeholder="https://example.com/product.png"
      />
      <p className="text-[11px] text-muted-foreground">
        Paste a direct image link (HTTPS). Leave blank to use the gradient
        below as the visual.
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
        {showPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Product preview"
            className="aspect-video w-full object-contain bg-checker"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-1 text-muted-foreground">
            {errored ? (
              <>
                <ImageOff className="h-8 w-8" />
                <p className="text-xs">
                  Could not load image — check the URL.
                </p>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                <p className="text-xs">Image preview will appear here</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
