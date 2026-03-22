import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function listRecentPayments(limit = 10) {
  const charges = await stripe.charges.list({ limit });
  return charges.data.map((c) => ({
    id: c.id,
    amount: (c.amount / 100).toFixed(2),
    currency: c.currency.toUpperCase(),
    status: c.status,
    description: c.description || "No description",
    customer: c.customer,
    created: new Date(c.created * 1000).toISOString(),
  }));
}

export async function getBalance() {
  const balance = await stripe.balance.retrieve();
  return {
    available: balance.available.map((b) => ({
      amount: (b.amount / 100).toFixed(2),
      currency: b.currency.toUpperCase(),
    })),
    pending: balance.pending.map((b) => ({
      amount: (b.amount / 100).toFixed(2),
      currency: b.currency.toUpperCase(),
    })),
  };
}

export async function listCustomers(limit = 10) {
  const customers = await stripe.customers.list({ limit });
  return customers.data.map((c) => ({
    id: c.id,
    name: c.name || "Unnamed",
    email: c.email || "No email",
    created: new Date(c.created * 1000).toISOString(),
  }));
}

export async function listInvoices(limit = 10) {
  const invoices = await stripe.invoices.list({ limit });
  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    customer: inv.customer_name || inv.customer_email || inv.customer,
    amount: ((inv.amount_due || 0) / 100).toFixed(2),
    currency: (inv.currency || "usd").toUpperCase(),
    status: inv.status,
    dueDate: inv.due_date
      ? new Date(inv.due_date * 1000).toISOString()
      : null,
    created: new Date(inv.created * 1000).toISOString(),
  }));
}

export async function createInvoice(
  customerEmail: string,
  items: { description: string; amount: number }[]
) {
  // Find or create customer
  const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
  let customer: Stripe.Customer;
  if (existing.data.length > 0) {
    customer = existing.data[0];
  } else {
    customer = await stripe.customers.create({ email: customerEmail });
  }

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 30,
  });

  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      description: item.description,
      amount: Math.round(item.amount * 100),
      currency: "usd",
    });
  }

  return {
    id: invoice.id,
    number: invoice.number,
    customer: customerEmail,
    items: items.map((i) => `${i.description}: $${i.amount.toFixed(2)}`),
    status: "draft",
  };
}

export async function sendInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.sendInvoice(invoiceId);
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    hostedUrl: invoice.hosted_invoice_url,
  };
}
