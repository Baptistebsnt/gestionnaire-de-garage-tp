export type OFFProduct = {
  code: string;
  product_name: string;
  brands?: string;
  image_thumb_url?: string;
};

const BASE = "https://world.openfoodfacts.org";
const FIELDS = "code,product_name,brands,image_thumb_url";

export const searchOFF = async (query: string): Promise<OFFProduct[]> => {
  if (!query.trim()) return [];
  const url = `${BASE}/cgi/search.pl?action=process&search_terms=${encodeURIComponent(query)}&json=1&page_size=8&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products as OFFProduct[]).filter((p) => !!p.product_name);
};

export const lookupOFF = async (barcode: string): Promise<OFFProduct | null> => {
  if (!barcode.trim()) return null;
  const url = `${BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product?.product_name) return null;
  return data.product as OFFProduct;
};
