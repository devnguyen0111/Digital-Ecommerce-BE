const nodemailer = require("nodemailer");
const config = require("../config/env");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to DN-Ecommerce!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to DN-Ecommerce, ${user.username}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul>
        <li>Browse our digital products</li>
        <li>Add funds to your wallet</li>
        <li>Make purchases securely</li>
        <li>Track your orders</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${user.username},</p>
      <p>You requested to reset your password. Please click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toLocaleString()} ${order.currency || "VND"}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p>Hello ${user.username},</p>
      <p>Thank you for your order! Your order has been confirmed.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      </div>

      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #333;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> ${order.subtotal.toLocaleString()} VND</p>
        ${order.shippingCost > 0 ? `<p style="margin: 5px 0;"><strong>Shipping:</strong> ${order.shippingCost.toLocaleString()} VND</p>` : ""}
        ${order.discount > 0 ? `<p style="margin: 5px 0;"><strong>Discount:</strong> -${order.discount.toLocaleString()} VND</p>` : ""}
        <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> ${order.totalAmount.toLocaleString()} VND</p>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
        <h3 style="margin-top: 0;">Shipping Address:</h3>
        <p style="margin: 5px 0;">${order.shippingAddress.fullName}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.phone}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.street}</p>
        <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
      </div>

      <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send order status update email
 */
const sendOrderStatusEmail = async (user, order, status) => {
  const statusMessages = {
    processing: "is being processed",
    shipped: "has been shipped",
    delivered: "has been delivered",
    cancelled: "has been cancelled",
  };

  const subject = `Order ${order.orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Status Update</h2>
      <p>Hello ${user.username},</p>
      <p>Your order <strong>${order.orderNumber}</strong> ${statusMessages[status]}.</p>
      
      ${
        order.trackingNumber
          ? `
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
        </div>
      `
          : ""
      }

      <p>You can view your order details in your account.</p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send wallet credit notification email
 */
const sendWalletCreditEmail = async (user, amount, balance) => {
  const subject = "Wallet Credit Notification";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Wallet Credit</h2>
      <p>Hello ${user.username},</p>
      <p>Your wallet has been credited with <strong>${amount.toLocaleString()} VND</strong>.</p>
      <p>Your current wallet balance is: <strong>${balance.toLocaleString()} VND</strong></p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send new ticket notification to admin
 */
const sendNewTicketNotification = async (ticket) => {
  const adminEmail = config.EMAIL_USER; // Send to support email
  const subject = `New Support Ticket: ${ticket.ticketNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Support Ticket Created</h2>
      <p>A new support ticket has been created:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
        <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
        <p style="margin: 5px 0;"><strong>Category:</strong> ${ticket.category}</p>
        <p style="margin: 5px 0;"><strong>Priority:</strong> ${ticket.priority}</p>
        <p style="margin: 5px 0;"><strong>Customer:</strong> ${ticket.user.username} (${ticket.user.email})</p>
      </div>

      <h3>Description:</h3>
      <p>${ticket.description}</p>

      <p style="margin-top: 30px;">Please respond to this ticket as soon as possible.</p>
      <p>Best regards,<br>DN-Ecommerce System</p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject,
    html,
  });
};

/**
 * Send ticket status update to customer
 */
const sendTicketStatusUpdate = async (user, ticket, oldStatus, newStatus) => {
  const subject = `Ticket ${ticket.ticketNumber} Updated: ${newStatus.replace("_", " ").toUpperCase()}`;

  const statusMessages = {
    open: "has been opened",
    in_progress: "is now being worked on",
    waiting_customer: "is waiting for your response",
    resolved: "has been resolved",
    closed: "has been closed",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Ticket Status Update</h2>
      <p>Hello ${user.username},</p>
      <p>Your support ticket <strong>${ticket.ticketNumber}</strong> ${statusMessages[newStatus]}.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
        <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
        <p style="margin: 5px 0;"><strong>Previous Status:</strong> ${oldStatus.replace("_", " ")}</p>
        <p style="margin: 5px 0;"><strong>New Status:</strong> ${newStatus.replace("_", " ")}</p>
      </div>

      ${
        newStatus === "resolved"
          ? `
        <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>✓ Your issue has been resolved!</strong></p>
          <p style="margin: 10px 0 0 0;">If you have any questions or the issue persists, please reply to this ticket.</p>
        </div>
      `
          : ""
      }

      <p>You can view the full ticket details in your account.</p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send new ticket response notification
 */
const sendNewTicketResponse = async (user, ticket, responseMessage) => {
  const subject = `New Response on Ticket ${ticket.ticketNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Response to Your Ticket</h2>
      <p>Hello ${user.username},</p>
      <p>Our support team has responded to your ticket <strong>${ticket.ticketNumber}</strong>.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
        <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${ticket.status.replace("_", " ")}</p>
      </div>

      <h3>Response:</h3>
      <div style="background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2196F3;">
        <p style="margin: 0;">${responseMessage}</p>
      </div>

      <p>You can view the full conversation and reply in your account.</p>
      <p>Best regards,<br>The DN-Ecommerce Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send email verification email
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  const subject = "Verify Your Email - DN-Ecommerce";
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; max-width: 600px;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                  <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                    <span style="font-size: 48px;">✉️</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Verify Your Email
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 300;">
                    ${user.username}
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 50px 40px;">
                  <p style="margin: 0 0 24px 0; color: #2d3748; font-size: 16px; line-height: 1.6;">
                    Welcome to <strong>DN-Ecommerce</strong>! To complete your registration and start exploring our marketplace, please verify your email address.
                  </p>

                  <p style="margin: 0 0 30px 0; color: #2d3748; font-size: 16px; line-height: 1.6;">
                    Click the button below to verify your email address:
                  </p>

                  <!-- Verification Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                    <tr>
                      <td align="center">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0; background: #f7fafc; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                          Or copy and paste this link:
                        </p>
                        <p style="margin: 0; color: #667eea; font-size: 13px; word-break: break-all;">
                          ${verificationUrl}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Important Notice -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #f56565;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                          ⚠️ IMPORTANT
                        </p>
                        <p style="margin: 0; color: #5a5a5a; font-size: 14px; line-height: 1.6;">
                          This verification link will expire in <strong>24 hours</strong>. If you didn't create an account, please ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    If you have any questions, our support team is here to help 24/7.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f7fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 16px 0; color: #2d3748; font-size: 16px; font-weight: 600;">
                          DN-Ecommerce
                        </p>
                        <p style="margin: 0 0 16px 0; color: #718096; font-size: 13px; line-height: 1.6;">
                          Your trusted partner in digital commerce
                        </p>
                        <p style="margin: 20px 0 0 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                          © ${new Date().getFullYear()} DN-Ecommerce. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendWalletCreditEmail,
  sendNewTicketNotification,
  sendTicketStatusUpdate,
  sendNewTicketResponse,
};
