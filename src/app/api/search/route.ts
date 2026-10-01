import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase/queries';
import { searchAndRankProducts } from '@/lib/searchUtils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const trimmed = query.trim();

    if (!trimmed) {
      return NextResponse.json({ products: [] });
    }

    const allProducts = await getProducts();
    const matched = searchAndRankProducts(allProducts, trimmed);

    // Return top 8 matching products
    const results = matched.slice(0, 8).map((p) => {
      const catName =
        typeof p.categories === 'object' && p.categories && 'name' in p.categories
          ? (p.categories as any).name
          : null;

      let typeBadge = 'Dress';
      if (p.is_toy) {
        typeBadge = 'Toy';
      } else if (p.is_accessory) {
        typeBadge = 'Accessory';
      } else if (catName) {
        typeBadge = catName;
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        mrp: p.mrp || null,
        image_url: p.image_url,
        type: typeBadge,
        is_toy: !!p.is_toy,
        is_accessory: !!p.is_accessory,
      };
    });

    return NextResponse.json({ products: results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
