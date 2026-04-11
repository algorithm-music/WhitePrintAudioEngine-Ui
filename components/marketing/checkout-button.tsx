'use client';

import { useState } from 'react';

export default function CheckoutButton({
  planKey,
  label,
  highlighted,
}: {
  planKey: string;
  label: string;
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        alert(data.error || 'Failed to create checkout');
      }
    } catch {
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full block text-center py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
          highlighted
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white'
        }`}
      >
        {loading ? 'Creating invoice...' : label}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#26A17B" />
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">$</text>
        </svg>
        USDT accepted
      </div>
    </div>
  );
}
