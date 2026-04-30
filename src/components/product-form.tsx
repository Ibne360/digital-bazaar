import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { ProductImageInput } from "@/components/product-image-input";
import { actionSaveProduct } from "@/app/actions";
import type { Product, Category, DeliveryType } from "@/lib/types";

const DELIVERY_OPTIONS: { value: DeliveryType; label: string }[] = [
  { value: "license_key", label: "License Key / CDK" },
  { value: "invite_link", label: "Invite link" },
  { value: "account", label: "Login credentials" },
  { value: "credits", label: "Credit top-up" },
  { value: "manual", label: "Manual fulfilment" },
];

const ICON_BG_OPTIONS = [
  "from-violet-500 to-fuchsia-500",
  "from-pink-500 to-rose-500",
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-purple-600 to-indigo-700",
  "from-zinc-700 to-zinc-900",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-700",
];

const ALL_BADGES = [
  { id: "instant", label: "Instant Delivery" },
  { id: "hot", label: "Hot Seller" },
  { id: "limited", label: "Limited Stock" },
  { id: "wholesale", label: "Wholesale Available" },
  { id: "new", label: "New Arrival" },
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit product" : "Create new product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={actionSaveProduct} className="space-y-5">
          {product ? (
            <input type="hidden" name="id" value={product.id} />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={product?.name}
                placeholder="ChatGPT Plus 1 Month CDK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={product?.categoryId}
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                required
                defaultValue={product?.duration}
                placeholder="1 Month / 3 Years / 1,000 Credits"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail price (USD)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id="retailPrice"
                  name="retailPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={product?.retailPrice}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">Wholesale price (USD)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id="wholesalePrice"
                  name="wholesalePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={product?.wholesalePrice}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty</Label>
              <Input
                id="warranty"
                name="warranty"
                required
                defaultValue={product?.warranty}
                placeholder="30-day replacement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryType">Delivery type</Label>
              <Select
                id="deliveryType"
                name="deliveryType"
                required
                defaultValue={product?.deliveryType || "manual"}
              >
                {DELIVERY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              required
              maxLength={140}
              defaultValue={product?.shortDescription}
              placeholder="One-liner that shows on product cards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Long description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={product?.description}
              placeholder="Full marketing copy shown on the product detail page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">
              Delivery instructions (shown to buyer)
            </Label>
            <Textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              rows={3}
              required
              defaultValue={product?.deliveryInstructions}
              placeholder="e.g. Redeem the CDK at chat.openai.com/redeem within 24 hours."
            />
          </div>

          <ProductImageInput defaultValue={product?.imageUrl} />

          <div className="space-y-2">
            <Label>Visual gradient (fallback when no image)</Label>
            <p className="text-[11px] text-muted-foreground">
              Used as the card background if no image URL is provided.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {ICON_BG_OPTIONS.map((bg) => (
                <label
                  key={bg}
                  className={`flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br p-1 ring-offset-2 transition-all has-[:checked]:ring-2 has-[:checked]:ring-primary ${bg}`}
                >
                  <input
                    type="radio"
                    name="iconBg"
                    value={bg}
                    defaultChecked={
                      (product?.iconBg || ICON_BG_OPTIONS[0]) === bg
                    }
                    className="sr-only"
                  />
                  <span className="block h-8 w-full rounded-md" />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Badges</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_BADGES.map((b) => (
                <label
                  key={b.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    name="badges"
                    value={b.id}
                    defaultChecked={product?.badges?.includes(b.id as any)}
                    className="h-4 w-4 rounded border-input"
                  />
                  {b.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured}
                className="h-4 w-4 rounded border-input"
              />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product?.active ?? true}
                className="h-4 w-4 rounded border-input"
              />
              Active (visible to customers)
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <SubmitButton variant="gradient" size="lg">
              {product ? "Save changes" : "Create product"}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
