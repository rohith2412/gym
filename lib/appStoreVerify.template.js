/**
 * TEMPLATE: App Store Server API Verification
 *
 * This file shows how to implement real App Store receipt verification
 * Copy this to appStoreVerify.js once you have your credentials:
 * - APP_STORE_KEY_ID
 * - APP_STORE_ISSUER_ID
 * - APP_STORE_PRIVATE_KEY
 *
 * Installation:
 * npm install apple-app-store-api jsonwebtoken
 */

// OPTION 1: Using apple-app-store-api package (Recommended)
// npm install apple-app-store-api

import { AppStoreServerAPI } from "apple-app-store-api";

const appStoreAPI = new AppStoreServerAPI({
  issuerId: process.env.APP_STORE_ISSUER_ID,
  bundleId: "com.pocketgym.app",
  keyId: process.env.APP_STORE_KEY_ID,
  privateKey: process.env.APP_STORE_PRIVATE_KEY,
});

export async function verifyAppStoreReceipt(originalTransactionId) {
  try {
    const response = await appStoreAPI.getSubscriptionStatuses(
      originalTransactionId
    );

    // Parse response
    const subscriptionStatus = response?.data?.[0];

    if (!subscriptionStatus) {
      return {
        valid: false,
        error: "No subscription found for transaction",
      };
    }

    // Check if subscription is active
    const isActive = subscriptionStatus.state === "Active";

    return {
      valid: isActive,
      originalTransactionId,
      productId: subscriptionStatus.productId,
      expiresDate: new Date(
        parseInt(subscriptionStatus.expiresDate) || Date.now()
      ),
      renewalInfo: subscriptionStatus.renewalInfo,
      state: subscriptionStatus.state, // Active, Expired, Revoked, etc
    };
  } catch (error) {
    console.error("App Store verification error:", error);
    return {
      valid: false,
      error: error.message,
    };
  }
}

// OPTION 2: Manual JWT implementation (More control)
// Only use this if you prefer not to use the library

// import jwt from "jsonwebtoken";

// const APP_STORE_API_URL = "https://api.storekit.itunes.apple.com";

// function getAppStoreJWT() {
//   const now = Math.floor(Date.now() / 1000);
//   const expiresAt = now + 3600; // 1 hour from now

//   const payload = {
//     iss: process.env.APP_STORE_ISSUER_ID,
//     iat: now,
//     exp: expiresAt,
//     aud: "appstoreconnect-v1",
//   };

//   // IMPORTANT: Must use ES256 algorithm for Apple
//   // jsonwebtoken supports this out of the box
//   const token = jwt.sign(payload, process.env.APP_STORE_PRIVATE_KEY, {
//     algorithm: "ES256",
//     keyid: process.env.APP_STORE_KEY_ID,
//   });

//   return token;
// }

// export async function verifyAppStoreReceipt(originalTransactionId) {
//   try {
//     const token = getAppStoreJWT();

//     const response = await fetch(
//       `${APP_STORE_API_URL}/inApps/v1/subscriptions/${originalTransactionId}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       console.error(`Apple API error: ${response.status}`);
//       return {
//         valid: false,
//         error: `Apple API returned ${response.status}`,
//       };
//     }

//     const data = await response.json();
//     const subscriptionStatus = data?.data?.[0];

//     if (!subscriptionStatus) {
//       return {
//         valid: false,
//         error: "No subscription found",
//       };
//     }

//     return {
//       valid: subscriptionStatus.state === "Active",
//       originalTransactionId,
//       productId: subscriptionStatus.productId,
//       expiresDate: new Date(subscriptionStatus.expiresDate),
//       renewalInfo: subscriptionStatus.renewalInfo,
//     };
//   } catch (error) {
//     console.error("App Store verification error:", error);
//     return {
//       valid: false,
//       error: error.message,
//     };
//   }
// }

/**
 * Usage in /api/subscription/verify-receipt/route.js:
 *
 * import { verifyAppStoreReceipt } from "@/lib/appStoreVerify";
 *
 * // In the POST handler:
 * const result = await verifyAppStoreReceipt(transactionId);
 *
 * if (!result.valid) {
 *   return Response.json({ error: result.error }, { status: 400 });
 * }
 *
 * // Rest of the code...
 */
