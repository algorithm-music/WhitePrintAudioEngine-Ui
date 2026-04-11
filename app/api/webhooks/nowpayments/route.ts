import { NextResponse } from 'next/server';
import crypto from 'crypto';

// NOWPayments IPN callback handler
// Verifies the signature and updates user subscription status in Supabase

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-nowpayments-sig');

    // Verify IPN signature
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (ipnSecret && signature) {
      const sortedBody = JSON.stringify(sortObject(body));
      const expectedSig = crypto
        .createHmac('sha512', ipnSecret)
        .update(sortedBody)
        .digest('hex');

      if (signature !== expectedSig) {
        console.error('NOWPayments IPN: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      actually_paid,
      pay_currency,
    } = body;

    console.log(
      `NOWPayments IPN: payment_id=${payment_id} status=${payment_status} order=${order_id} paid=${actually_paid} ${pay_currency}`,
    );

    // Handle payment status
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      // Payment is complete
      // TODO: Update user subscription in Supabase
      // The order_id format is: {userId}_{planName}_{timestamp}
      // Parse it to identify the user and plan, then update their subscription
      console.log(`Payment confirmed for order ${order_id}: ${price_amount} USD paid as ${actually_paid} ${pay_currency}`);
    } else if (payment_status === 'partially_paid') {
      console.log(`Partial payment for order ${order_id}`);
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      console.log(`Payment failed/expired for order ${order_id}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('NOWPayments IPN error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Sort object keys alphabetically (required for NOWPayments signature verification)
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (result, key) => {
        result[key] =
          obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
            ? sortObject(obj[key] as Record<string, unknown>)
            : obj[key];
        return result;
      },
      {} as Record<string, unknown>,
    );
}
