import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/ProductForm';

export default async function NewProduct() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from('categories').select('*').order('sort_order');

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
