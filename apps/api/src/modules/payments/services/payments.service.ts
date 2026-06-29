import crypto from "crypto";
import * as paymentRepository from "../repositories/payments.repository";
import * as orderRepository from "../../orders/repositories/orders.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import { env } from "../../../lib/env";

function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const secret = env.RAZORPAY_KEY_SECRET ?? "";
  if (!secret) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
}

export async function createPaymentOrder(orderId: string, userId: string) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }

  if (order.userId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "This order does not belong to you");
  }

  const existingPayment = await paymentRepository.findPaymentByOrderId(orderId);
  if (existingPayment) {
    throw new AppError(ErrorCode.CONFLICT, "Payment already exists for this order");
  }

  const mockRazorpayOrderId = "order_" + crypto.randomBytes(12).toString("hex");

  const payment = await paymentRepository.createPayment({
    orderId,
    razorpayOrderId: mockRazorpayOrderId,
    amount: order.grandTotal,
    status: "UNPAID",
  });

  return payment;
}

export async function verifyPayment(
  data: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  },
  userId: string,
) {
  const payment = await paymentRepository.findPaymentByRazorpayOrderId(data.razorpayOrderId);
  if (!payment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Payment not found");
  }

  const order = await orderRepository.getOrderById(payment.orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }

  if (order.userId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "This payment does not belong to you");
  }

  if (payment.status !== "UNPAID") {
    throw new AppError(ErrorCode.PAYMENT_FAILED, "Payment already processed");
  }

  const isValid = verifyRazorpaySignature(
    data.razorpayOrderId,
    data.razorpayPaymentId,
    data.razorpaySignature,
  );
  if (!isValid) {
    throw new AppError(ErrorCode.PAYMENT_FAILED, "Invalid payment signature");
  }

  const updatedPayment = await paymentRepository.updatePaymentStatus(
    payment.id,
    "PAID",
    data.razorpayPaymentId,
  );

  await orderRepository.updateOrderPaymentStatus(payment.orderId, "PAID");

  return updatedPayment;
}

export async function getPaymentByOrder(orderId: string, userId: string) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }

  if (order.userId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "This order does not belong to you");
  }

  const payment = await paymentRepository.findPaymentByOrderId(orderId);
  if (!payment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Payment not found for this order");
  }
  return payment;
}
