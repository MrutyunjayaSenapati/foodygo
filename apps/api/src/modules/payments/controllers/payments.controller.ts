import type { Request, Response } from "express";
import * as paymentService from "../services/payments.service";
import { sendSuccess } from "../../../utils/response";

export const createPaymentOrder = async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentOrder(req.body.orderId, req.user!.userId);
  sendSuccess(res, result, 201);
};

export const verifyPayment = async (req: Request, res: Response) => {
  const result = await paymentService.verifyPayment(
    {
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpaySignature: req.body.razorpaySignature,
    },
    req.user!.userId,
  );
  sendSuccess(res, result);
};

export const getPaymentByOrder = async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentByOrder(
    String(req.params.orderId),
    req.user!.userId,
  );
  sendSuccess(res, result);
};
