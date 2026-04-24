# Subscription System Implementation Guide

## Overview

This document provides step-by-step instructions for completing the subscription system implementation with App Store IAP and MongoDB.

## Architecture

```
┌─────────────────┐
│  React Native   │
│  (Frontend)     │
└────────┬────────┘
         │ 1. User taps "Subscribe"
         │ 2. App calls react-native-iap
         │ 3. Apple processes purchase
         │ 4. Returns receipt
         │
┌────────▼────────────────────────────┐
│   Backend (Node.js/Next.js)          │
│ /api/subscription/verify-receipt     │
│ - Verify receipt with Apple          │
│ - Create/update subscription in DB   │
└────────┬─────────────────────────────┘
         │ 5. Calls Apple API
         │
┌────────▼────────────┐
│  Apple App Store    │
│  Server API         │
└─────────────────────┘
```

## Files Created

### Backend Files
- `/models/subscriptionModel.js` - MongoDB schema
- `/app/api/subscription/status/route.js` - Check subscription status
- `/app/api/subscription/verify-receipt/route.js` - Verify App Store receipt
- `/app/api/subscription/restore/route.js` - Restore purchases on reinstall

### Frontend Files
- `/src/services/iapService.ts` - IAP service (react-native-iap wrapper)
- `/src/hooks/usePurchase.ts` - Purchase hook with backend integration
- `/src/config/iapConfig.ts` - IAP configuration
- `/components/PremiumGate.tsx` - Premium content gating with paywall UI

## Implementation Checklist

### Phase 1: Setup (Prepare Credentials)

- [ ] Create App Store Connect account (if not already done)
- [ ] Create your app in App Store Connect
- [ ] Generate App Store Server API Key
  - Go to App Store Connect
  - Navigate to Users and Access > API Keys
  - Click "Generate API Key"
  - Select "In-App Purchase" 
  - Download the `.p8` file (keep secure)
  - Note the Key ID and Issuer ID

### Phase 2: Frontend Setup

- [ ] Install react-native-iap: `npm install react-native-iap`
- [ ] Configure product IDs in App Store Connect:
  - [ ] Add `com.pocketgym.premium.monthly` subscription
  - [ ] Add `com.pocketgym.premium.annual` subscription
  - [ ] Set prices ($12/month, $99/year recommended)
  - [ ] Enable auto-renewal
- [ ] Update bundle ID in `iapConfig.ts`
- [ ] Test IAP in React Native with TestFlight (Sandbox)

### Phase 3: Backend Setup

- [ ] Add environment variables:
  ```bash
  # .env.local
  APP_STORE_KEY_ID=your_key_id
  APP_STORE_ISSUER_ID=your_issuer_id
  APP_STORE_PRIVATE_KEY=<contents of .p8 file>
  ```

- [ ] Install dependencies:
  ```bash
  npm install jsonwebtoken uuid
  ```

### Phase 4: Implement Apple Receipt Verification

Replace the TODO in `/app/api/subscription/verify-receipt/route.js` with real verification.

**Implementation steps:**

1. Create a helper function in `/lib/appStoreVerify.js`:

```javascript
import jwt from "jsonwebtoken";

const APP_STORE_API_URL = "https://api.storekit.itunes.apple.com";

async function getAppStoreToken() {
  const header = {
    alg: "ES256",
    kid: process.env.APP_STORE_KEY_ID,
    typ: "JWT",
  };

  const payload = {
    iss: process.env.APP_STORE_ISSUER_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: "appstoreconnect-v1",
  };

  // Note: You'll need to use a different JWT library for ES256
  // because jsonwebtoken might not support it. Consider:
  // npm install apple-app-store-api
  const token = jwt.sign(payload, process.env.APP_STORE_PRIVATE_KEY, {
    algorithm: "ES256",
    header,
  });

  return token;
}

export async function verifyAppStoreReceipt(originalTransactionId) {
  try {
    const token = await getAppStoreToken();

    const response = await fetch(
      `${APP_STORE_API_URL}/inApps/v1/subscriptions/${originalTransactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple API returned ${response.status}`);
    }

    const data = await response.json();

    // Parse the response to get subscription status
    // See: https://developer.apple.com/documentation/appstoreserverapi/subscriptiongroupidentifieritem
    const subscriptionData = data.data?.[0];

    return {
      valid: true,
      originalTransactionId,
      productId: subscriptionData?.productId,
      expiresDate: new Date(subscriptionData?.expiresDate),
      renewalInfo: subscriptionData?.renewalInfo,
    };
  } catch (error) {
    console.error("App Store verification error:", error);
    return {
      valid: false,
      error: error.message,
    };
  }
}
```

2. Update `/app/api/subscription/verify-receipt/route.js`:

```javascript
import { verifyAppStoreReceipt } from "@/lib/appStoreVerify";

// In the POST handler, replace the verifyWithApple function:
const result = await verifyAppStoreReceipt(transactionId);
```

### Phase 5: Test Integration

1. **Local Testing:**
   - Set up simulator or device
   - Create test user in App Store Connect
   - Use TestFlight beta app
   - Test purchase flow with sandbox products

2. **Testing Checklist:**
   - [ ] User can see paywall when not premium
   - [ ] Purchase flow completes
   - [ ] Receipt is sent to backend
   - [ ] Backend creates subscription in MongoDB
   - [ ] Frontend receives premium status
   - [ ] Paywall closes and content is accessible
   - [ ] User can restore purchases after reinstall
   - [ ] Subscription status persists across app launches

### Phase 6: Production Deployment

1. **Before App Store Submission:**
   - [ ] Complete real App Store API integration
   - [ ] Test with real App Store credentials
   - [ ] Add error handling for network failures
   - [ ] Implement subscription renewal checks (background job)
   - [ ] Add analytics/logging for purchases
   - [ ] Encrypt receipt data in database

2. **Submit to App Store:**
   - [ ] Follow App Store Review Guidelines
   - [ ] Ensure in-app purchase disclosure
   - [ ] Support subscription management
   - [ ] Implement cancellation flow
   - [ ] Test on multiple devices
   - [ ] Submit TestFlight version

## API Reference

### GET /api/subscription/status
**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "isPremium": true,
  "subscription": {
    "status": "active",
    "plan": "premium",
    "startDate": "2024-04-22T00:00:00Z",
    "endDate": "2024-05-22T00:00:00Z",
    "trialEndsAt": null
  },
  "daysUntilRenewal": 30,
  "canAccessAITrainer": true,
  "canAccessRecipes": true,
  "canAccessMacroScanner": true
}
```

### POST /api/subscription/verify-receipt
**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "receiptData": "base64_encoded_receipt",
  "bundleId": "com.pocketgym.app",
  "transactionId": "transaction_id"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "status": "active",
    "endDate": "2024-05-22T00:00:00Z",
    "plan": "premium"
  }
}
```

### POST /api/subscription/restore
**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "subscription": {
    "status": "active",
    "plan": "premium",
    "endDate": "2024-05-22T00:00:00Z",
    "startDate": "2024-04-22T00:00:00Z"
  },
  "message": "Subscription restored successfully"
}
```

## Security Considerations

1. **Receipt Verification:**
   - Always verify receipts with Apple API
   - Never trust client-provided subscription status
   - Cache verification results to reduce API calls

2. **User Data:**
   - Encrypt receipt data in database
   - Don't log sensitive transaction IDs
   - Use HTTPS for all API calls

3. **Token Management:**
   - Use short-lived tokens for API calls
   - Rotate App Store API keys regularly
   - Keep .p8 file secure (use environment variables)

## Troubleshooting

### Common Issues

**Purchase not working:**
- Check product IDs match App Store Connect
- Verify bundle ID is correct
- Ensure test user is signed in on device
- Check device time is correct (clock skew can cause issues)

**Receipt verification fails:**
- Verify App Store API key is correct
- Check JWT token is properly signed
- Ensure originalTransactionId is valid
- Try verifying in sandbox first

**Subscription not showing premium:**
- Check subscription status query is working
- Verify MongoDB connection
- Check JWT token is valid
- Try refreshing subscription status in app

## Next Steps

1. Get App Store credentials ready (Key ID, Issuer ID, .p8 file)
2. Implement real Apple API verification in `/lib/appStoreVerify.js`
3. Test with TestFlight on real devices
4. Set up background job for subscription renewal checks
5. Add App Store cancellation flow UI
6. Deploy to production and submit for App Store review
