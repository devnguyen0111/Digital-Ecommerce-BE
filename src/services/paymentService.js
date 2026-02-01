const crypto = require("crypto");
const config = require("../config/env");
const logger = require("../utils/logger");

/**
 * PayOS Payment Service
 * Documentation: https://payos.vn/docs/
 */

class PayOSService {
  constructor() {
    this.clientId = config.PAYOS_CLIENT_ID;
    this.apiKey = config.PAYOS_API_KEY;
    this.checksumKey = config.PAYOS_CHECKSUM_KEY;
    this.returnUrl = config.PAYOS_RETURN_URL;
    this.cancelUrl = config.PAYOS_CANCEL_URL;
    this.apiBaseUrl = "https://api-merchant.payos.vn";
  }

  /**
   * Generate signature for PayOS request
   * According to PayOS docs: SHA256(amount + cancelUrl + description + orderCode + returnUrl)
   */
  generateSignature(data) {
    const { amount, cancelUrl, description, orderCode, returnUrl } = data;
    const signatureData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;

    return crypto
      .createHmac("sha256", this.checksumKey)
      .update(signatureData)
      .digest("hex");
  }

  /**
   * Verify webhook signature
   * PayOS signature verification: HMAC-SHA256 of sorted data fields
   */
  verifyWebhookSignature(webhookData) {
    // Skip verification in development if configured
    if (process.env.PAYOS_SKIP_SIGNATURE === 'true') {
      logger.warn('SKIPPING signature verification (development mode)');
      return true;
    }

    const { data, signature } = webhookData;

    if (!signature) {
      logger.error('No signature provided in webhook');
      return false;
    }

    try {
      // Sort data fields alphabetically (PayOS requirement)
      const sortedKeys = Object.keys(data).sort();
      
      // Build signature string
      const signatureParts = [];
      sortedKeys.forEach(key => {
        const value = data[key];
        // Include non-empty values
        if (value !== null && value !== undefined && value !== '') {
          signatureParts.push(`${key}=${value}`);
        }
      });
      
      const signatureStr = signatureParts.join('&');
      
      // Calculate expected signature
      const expectedSignature = crypto
        .createHmac("sha256", this.checksumKey)
        .update(signatureStr)
        .digest("hex");

      logger.debug('Signature Verification', {
        dataString: signatureStr.substring(0, 100) + '...',
        signatureReceived: signature,
        signatureExpected: expectedSignature,
        match: signature === expectedSignature
      });

      return signature === expectedSignature;
    } catch (error) {
      logger.error('Error verifying signature', error);
      return false;
    }
  }

  /**
   * Create payment link
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment link details
   */
  async createPaymentLink(paymentData) {
    const { orderId, amount, description, buyerName, buyerEmail, buyerPhone } =
      paymentData;

    // Generate unique order code (timestamp + random)
    const orderCode = parseInt(
      `${Date.now()}${Math.floor(Math.random() * 1000)}`,
    );

    const requestData = {
      orderCode,
      amount,
      description: description || "Nạp tiền vào ví DN-Ecommerce",
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress: "",
      items: [
        {
          name: description || "Nạp tiền vào ví",
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl: this.returnUrl,
      cancelUrl: this.cancelUrl,
      expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };

    // Generate signature
    requestData.signature = this.generateSignature(requestData);

    try {
      const axios = require("axios");
      const response = await axios.post(
        `${this.apiBaseUrl}/v2/payment-requests`,
        requestData,
        {
          headers: {
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.code === "00") {
        return {
          success: true,
          orderCode,
          paymentLinkId: response.data.data.paymentLinkId,
          checkoutUrl: response.data.data.checkoutUrl,
          qrCode: response.data.data.qrCode,
          status: response.data.data.status,
        };
      } else {
        throw new Error(response.data.desc || "Failed to create payment link");
      }
    } catch (error) {
      console.error(
        "PayOS createPaymentLink error:",
        error.response?.data || error,
      );
      throw new Error(
        error.response?.data?.desc ||
          error.message ||
          "Failed to create payment link",
      );
    }
  }

  /**
   * Get payment status
   * @param {number} orderCode - PayOS order code
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(orderCode) {
    try {
      const axios = require("axios");
      const response = await axios.get(
        `${this.apiBaseUrl}/v2/payment-requests/${orderCode}`,
        {
          headers: {
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
          },
        },
      );

      if (response.data.code === "00") {
        const data = response.data.data;
        return {
          success: true,
          orderCode: data.orderCode,
          status: data.status,
          amount: data.amount,
          transactions: data.transactions,
          createdAt: data.createdAt,
          paidAt: data.transactions?.[0]?.transactionDateTime,
        };
      } else {
        throw new Error(response.data.desc || "Failed to get payment status");
      }
    } catch (error) {
      console.error(
        "PayOS getPaymentStatus error:",
        error.response?.data || error,
      );
      throw new Error(
        error.response?.data?.desc || "Failed to get payment status",
      );
    }
  }

  /**
   * Process webhook from PayOS
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} Processed webhook data
   */
  processWebhook(webhookData) {
    logger.webhook('Received', {
      rootCode: webhookData.code,
      rootDesc: webhookData.desc,
      success: webhookData.success,
      orderCode: webhookData.data?.orderCode,
      amount: webhookData.data?.amount
    });

    // Verify signature
    const isValid = this.verifyWebhookSignature(webhookData);

    if (!isValid) {
      logger.error('Invalid webhook signature!');
      throw new Error("Invalid webhook signature");
    }

    const { data } = webhookData;

    // Determine payment status based on PayOS response
    let status = 'PENDING';
    
    // Check root level first
    if (webhookData.code === '00' && webhookData.success === true) {
      status = 'PAID';
    } 
    // Check for cancellation
    else if (webhookData.code === '02') {
      status = 'CANCELLED';
    }
    // Check data level code
    else if (data.code === '00') {
      status = 'PAID';
    }
    // Fallback to explicit status field if present
    else if (data.status) {
      status = data.status;
    }

    logger.payment('Status Determined', { status, orderCode: data.orderCode });

    return {
      orderCode: data.orderCode,
      status: status,
      amount: data.amount,
      description: data.description,
      transactions: data.transactions || [],
      code: data.code,
      message: data.desc,
      reference: data.reference,
      transactionDateTime: data.transactionDateTime,
      paymentLinkId: data.paymentLinkId,
      currency: data.currency,
      counterAccountBankId: data.counterAccountBankId,
      counterAccountBankName: data.counterAccountBankName,
      counterAccountName: data.counterAccountName,
      counterAccountNumber: data.counterAccountNumber,
      accountNumber: data.accountNumber,
      virtualAccountName: data.virtualAccountName,
      virtualAccountNumber: data.virtualAccountNumber
    };
  }

  /**
   * Cancel payment
   * @param {number} orderCode - PayOS order code
   * @param {string} cancellationReason - Reason for cancellation
   */
  async cancelPayment(
    orderCode,
    cancellationReason = "User requested cancellation",
  ) {
    try {
      const axios = require("axios");
      const response = await axios.post(
        `${this.apiBaseUrl}/v2/payment-requests/${orderCode}/cancel`,
        {
          cancellationReason,
        },
        {
          headers: {
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.code === "00") {
        return { success: true, message: "Payment cancelled successfully" };
      } else {
        throw new Error(response.data.desc || "Failed to cancel payment");
      }
    } catch (error) {
      console.error(
        "PayOS cancelPayment error:",
        error.response?.data || error,
      );
      throw new Error(error.response?.data?.desc || "Failed to cancel payment");
    }
  }
}

module.exports = new PayOSService();
