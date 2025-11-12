# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for the DevSync sponsor page.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in your Stripe Dashboard)

## Installation

1. Install Stripe packages:
```bash
npm install stripe @stripe/stripe-js
```

2. Install TypeScript types (if using TypeScript):
```bash
npm install --save-dev @types/stripe
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # Get from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Get from Stripe Dashboard
NEXT_PUBLIC_URL=http://localhost:3000 # Your app URL
```

**Important:** 
- Use test keys during development
- Use live keys in production
- Never commit these keys to version control

## Implementation Steps

### 1. Update the Checkout Route

Edit `app/api/stripe/checkout/route.ts` and uncomment the Stripe implementation code.

### 2. Create Success Page

Create `app/sponsors/success/page.tsx` to handle successful payments:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Heart } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify payment with your backend
    if (sessionId) {
      // Call your API to verify the session
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-400 mb-8">
          Your sponsorship payment was successful.
        </p>
        <Link
          href="/sponsors"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
        >
          <Heart className="w-5 h-5" />
          Return to Sponsors
        </Link>
      </div>
    </div>
  );
}
```

### 3. Update Sponsor Page

Update `app/sponsors/page.tsx` to use the Stripe checkout API:

```tsx
const handlePayment = async (tier: typeof sponsorTiers[0]) => {
  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tier: tier.name,
        amount: tier.price,
        email: email,
        companyName: companyName,
      }),
    });

    const data = await response.json();
    
    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      // Fallback to email
      const subject = encodeURIComponent(`Sponsorship Inquiry - ${tier.name} Tier`);
      const body = encodeURIComponent(
        `Hello DevSync Team,\n\nI'm interested in becoming a ${tier.name} sponsor.\n\nCompany: ${companyName || "N/A"}\nEmail: ${email || "N/A"}\n\nPlease let me know the next steps.\n\nBest regards`
      );
      window.location.href = `mailto:sponsors@devsync.com?subject=${subject}&body=${body}`;
    }
  } catch (error) {
    console.error("Payment error:", error);
    // Fallback to email
    alert("Payment processing unavailable. Please contact us via email.");
  }
};
```

### 4. Webhook Setup (Optional but Recommended)

Create `app/api/stripe/webhook/route.ts` to handle Stripe webhooks:

```tsx
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      // Update your database with the sponsorship
      // await updateSponsorInDatabase(session);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Handle subscription changes
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

## Alternative Payment Options

If you prefer not to use Stripe, consider:

1. **PayPal** - Good for international payments
   - Install: `npm install @paypal/react-paypal-js`
   - Documentation: https://developer.paypal.com

2. **Paddle** - Good for SaaS subscriptions
   - Documentation: https://developer.paddle.com

3. **LemonSqueezy** - Modern payment platform
   - Documentation: https://docs.lemonsqueezy.com

## Testing

1. Use Stripe test mode during development
2. Test cards: https://stripe.com/docs/testing
3. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Security Best Practices

1. Never expose secret keys in client-side code
2. Always validate webhook signatures
3. Use HTTPS in production
4. Implement rate limiting on payment endpoints
5. Store payment data securely (consider using Stripe's secure storage)

## Support

For issues or questions:
- Stripe Support: https://support.stripe.com
- Stripe Documentation: https://stripe.com/docs

