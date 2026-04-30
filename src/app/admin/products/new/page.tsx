import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllCategories } from "@/lib/supabase/queries";
import { ProductForm } from "@/components/product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <ProductForm categories={categories} />
    </div>
  );
}
