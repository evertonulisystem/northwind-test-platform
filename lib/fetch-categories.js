export async function fetchAllCategories(headers) {
  const categories = [];
  let page = 1;
  let hasNextPage;

  do {
    const response = await fetch(`/api/v1/categories?page=${page}&limit=100`, {
      headers,
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.mensagens?.[0] || "Erro ao carregar categorias");
    }

    categories.push(...(result.data || []));
    hasNextPage = result.pagination?.hasNextPage === true;
    page += 1;
  } while (hasNextPage);

  return categories;
}
