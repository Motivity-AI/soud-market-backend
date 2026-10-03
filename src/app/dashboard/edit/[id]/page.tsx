import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/ProductForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditProduct({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('sort_order')
  ]);

  if (!product || product.trader_id !== user.id) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">تعديل المنتج</h1>
      <ProductForm categories={categories ?? []} initial={product} />
    </div>
  );
}
