import { ProductsCatalog } from "@/components/commerce/products-catalog";
import { TopNav } from "@/components/layout/top-nav";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />
      <ProductsCatalog />
    </main>
  );
}
