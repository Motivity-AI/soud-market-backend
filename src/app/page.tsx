import { createClient } from '@/lib/supabase/server';
import ProductFeed from '@/components/ProductFeed';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams
}: {
  searchParams: { q?: string; cat?: string; state?: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories').select('*').order('sort_order');

  let query = supabase
    .from('product_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);

  if (searchParams.q)
    query = query.or(
      `name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,trader_name.ilike.%${searchParams.q}%,market.ilike.%${searchParams.q}%`
    );
  if (searchParams.state) query = query.eq('state', searchParams.state);
  if (searchParams.cat) query = query.eq('category_slug', searchParams.cat);

  const { data: products } = await query;

  return (
    <ProductFeed
      initialProducts={products ?? []}
      categories={categories ?? []}
      initialFilters={{
        q: searchParams.q ?? '',
        category: searchParams.cat ?? '',
        state: searchParams.state ?? ''
      }}
    />
  );
}
