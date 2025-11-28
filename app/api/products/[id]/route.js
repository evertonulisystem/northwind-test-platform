// app/api/products/[id]/route.js
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const id = params.id;

    const { data: updated, error } = await supabase
      .from('products')
      .update({
        name: data.name,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity, 10),
        sku: data.sku || null,
        category_id: data.category_id || null,
        supplier_id: data.supplier_id || null,
      })
      .eq('id', id)
      .select(`
        id, name, price, stock_quantity, sku, image_url, created_at,
        category_id, supplier_id,
        categories (name),
        suppliers (company_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}