import { getServiceToken } from "@/lib/token-vault";

async function getShopifyToken(): Promise<string> {
  return getServiceToken("shopify");
}

async function shopifyApi(token: string, endpoint: string) {
  // Shopify OAuth tokens are scoped to a specific shop
  // For Token Vault, we get the token and call the API
  const res = await fetch(endpoint, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify API error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function getShopInfo(userId: string) {
  const token = await getShopifyToken();
  // Use Shopify's authenticated endpoint to discover shop
  const res = await fetch("https://shopify.com/admin/api/2024-01/shop.json", {
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
  });
  if (!res.ok) return { note: "Shop info requires shop domain configuration" };
  return res.json();
}

export async function listProducts(userId: string, limit = 10) {
  const token = await getShopifyToken();
  return { products: [], note: "Shopify products require shop domain. Token Vault provides the access token, configure shop domain to enable product listing.", tokenAvailable: true };
}

export async function listOrders(userId: string, limit = 10) {
  const token = await getShopifyToken();
  return { orders: [], note: "Shopify orders require shop domain. Token Vault provides the access token.", tokenAvailable: true };
}

export async function getProduct(userId: string, productId: string) {
  const token = await getShopifyToken();
  return { product: null, note: "Requires shop domain configuration", tokenAvailable: true };
}
