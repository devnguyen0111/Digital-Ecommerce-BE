const axios = require("axios");

/**
 * Test PayOS Webhook locally
 * Run: node test-webhook.js
 */

const WEBHOOK_URL = "http://localhost:5000/api/wallet/payos-webhook";
// Or use ngrok URL: https://xxxx.ngrok-free.app/api/wallet/payos-webhook

// Test data - replace orderCode with real one from your payment
const testWebhookData = {
  data: {
    orderCode: 1769920907023627, // ← CHANGE THIS to your actual orderCode
    amount: 100000,
    description: "Nạp tiền vào ví",
    accountNumber: "1234567890",
    reference: "TXN123456789",
    transactionDateTime: new Date().toISOString(),
    currency: "VND",
    paymentLinkId: "test-payment-link-id",
    code: "00",
    desc: "Thành công",
    counterAccountBankId: null,
    counterAccountBankName: null,
    counterAccountName: null,
    counterAccountNumber: null,
    virtualAccountName: null,
    virtualAccountNumber: null,
    status: "PAID", // PAID, CANCELLED, EXPIRED
  },
  signature: "test_signature_will_be_verified", // Backend will verify this
};

async function testWebhook() {
  try {
    console.log("🔄 Testing webhook...");
    console.log("URL:", WEBHOOK_URL);
    console.log("Order Code:", testWebhookData.data.orderCode);
    console.log("Amount:", testWebhookData.data.amount);
    console.log("---");

    const response = await axios.post(WEBHOOK_URL, testWebhookData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Webhook Response:");
    console.log("Status:", response.status);
    console.log("Data:", response.data);

    if (response.data.success) {
      console.log("\n✅ SUCCESS! Webhook processed successfully");
      console.log("💰 Wallet should be credited now. Check with:");
      console.log("   GET /api/wallet/balance");
      console.log("   GET /api/wallet/transactions");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);

      if (error.response.status === 404) {
        console.error("\n⚠️  Payment not found in database!");
        console.error("Make sure you created a payment first with:");
        console.error("POST /api/wallet/add-funds");
      } else if (error.response.status === 400) {
        console.error("\n⚠️  Signature verification failed or invalid data");
      }
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n⚠️  Server is not running!");
      console.error("Start the server with: npm start");
    }
  }
}

// Run test
testWebhook();
