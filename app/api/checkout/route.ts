import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/nowpayments';

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  standard: { amount: 67, name: 'Standard' },
  'standard-annual': { amount: 648, name: 'Standard Annual' },
  pro: { amount: 1365, name: 'Pro' },
  'pro-annual': { amount: 13104, name: 'Pro Annual' },
  api: { amount: 2745, name: 'API' },
  'api-annual': { amount: 26352, name: 'API Annual' },
  whitelabel: { amount: 6883, name: 'White Label' },
  'whitelabel-annual': { amount: 66072, name: 'White Label Annual' },
};

export async function POST(request: Request) {
  try {
    const { plan, userId, email } = await request.json();

    const planInfo = PLAN_PRICES[plan];
    if (!planInfo) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://whiteprint.audio';
    const orderId = `${userId || 'guest'}_${plan}_${Date.now()}`;

    const invoice = await createInvoice({
      priceAmount: planInfo.amount,
      priceCurrency: 'usd',
      payCurrency: 'usdttrc20',
      orderId,
      orderDescription: `WhitePrint ${planInfo.name} Plan`,
      ipnCallbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
      successUrl: `${baseUrl}/app?payment=success&plan=${plan}`,
      cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
    });

    return NextResponse.json({
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      orderId,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 },
    );
  }
}
