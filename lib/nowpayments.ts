const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

function getApiKey() {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error('NOWPAYMENTS_API_KEY is not set');
  return key;
}

const headers = () => ({
  'x-api-key': getApiKey(),
  'Content-Type': 'application/json',
});

// ---------- Types ----------

export type NowPaymentsPlan = {
  id: string;
  title: string;
  interval_day: number;
  amount: number;
  currency: string;
};

export type NowPaymentsInvoice = {
  id: string;
  invoice_url: string;
  order_id: string;
  price_amount: number;
  price_currency: string;
  pay_address?: string;
  pay_amount?: number;
  pay_currency?: string;
};

export type NowPaymentsStatus = {
  payment_id: number;
  payment_status: string;
  order_id: string;
  price_amount: number;
  actually_paid: number;
  pay_currency: string;
};

// ---------- Invoices (one-time payments) ----------

export async function createInvoice({
  priceAmount,
  priceCurrency = 'usd',
  payCurrency = 'usdttrc20',
  orderId,
  orderDescription,
  ipnCallbackUrl,
  successUrl,
  cancelUrl,
}: {
  priceAmount: number;
  priceCurrency?: string;
  payCurrency?: string;
  orderId: string;
  orderDescription?: string;
  ipnCallbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<NowPaymentsInvoice> {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      price_amount: priceAmount,
      price_currency: priceCurrency,
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NOWPayments invoice error: ${err}`);
  }

  return res.json();
}

// ---------- Subscription Plans ----------

export async function createSubscriptionPlan({
  title,
  intervalDay,
  amount,
  currency = 'usd',
  ipnCallbackUrl,
}: {
  title: string;
  intervalDay: number;
  amount: number;
  currency?: string;
  ipnCallbackUrl?: string;
}): Promise<NowPaymentsPlan> {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/subscriptions/plans`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      title,
      interval_day: intervalDay,
      amount,
      currency,
      ipn_callback_url: ipnCallbackUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NOWPayments plan error: ${err}`);
  }

  return res.json();
}

export async function getSubscriptionPlan(planId: string): Promise<NowPaymentsPlan> {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/subscriptions/plans/${planId}`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error('Failed to fetch plan');
  return res.json();
}

// ---------- Subscriptions (email-based) ----------

export async function createEmailSubscription({
  planId,
  email,
}: {
  planId: string;
  email: string;
}) {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/subscriptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      subscription_plan_id: planId,
      email,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NOWPayments subscription error: ${err}`);
  }

  return res.json();
}

// ---------- Payment Status ----------

export async function getPaymentStatus(paymentId: string): Promise<NowPaymentsStatus> {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error('Failed to fetch payment status');
  return res.json();
}

// ---------- API Status ----------

export async function getApiStatus(): Promise<{ message: string }> {
  const res = await fetch(`${NOWPAYMENTS_API_URL}/status`);
  return res.json();
}
