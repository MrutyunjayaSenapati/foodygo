import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

function verifyPaymentSignature(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  signature: string,
  secret: string,
): boolean {
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  );
}

describe("Payment signature verification", () => {
  it("should verify a valid signature", () => {
    const paymentId = "pay_123456";
    const orderId = "order_123456";
    const secret = "test_secret";

    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const result = verifyPaymentSignature(paymentId, orderId, validSignature, secret);
    expect(result).toBe(true);
  });

  it("should reject an invalid signature", () => {
    const paymentId = "pay_123456";
    const orderId = "order_123456";
    const secret = "test_secret";

    const result = verifyPaymentSignature(
      paymentId,
      orderId,
      "invalid_signature",
      secret,
    );
    expect(result).toBe(false);
  });

  it("should reject signature with wrong secret", () => {
    const paymentId = "pay_123456";
    const orderId = "order_123456";

    const payload = `${orderId}|${paymentId}`;
    const signature = crypto
      .createHmac("sha256", "correct_secret")
      .update(payload)
      .digest("hex");

    const result = verifyPaymentSignature(paymentId, orderId, signature, "wrong_secret");
    expect(result).toBe(false);
  });
});
