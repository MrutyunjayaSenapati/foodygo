import express from "express";
import type { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import crypto from "node:crypto";
import path from "node:path";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/error-handler";
import { rateLimiter } from "./middleware/rate-limiter";
import { requestId } from "./middleware/request-id";
import { openapiSpec } from "./docs/openapi";
import { db } from "./lib/db";
import { payments } from "./db/schema/payments";
import { orders } from "./db/schema/orders";
import routes from "./routes";

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(compression());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);
app.use(requestId);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
      err: (err) => ({ message: err.message }),
    },
  }),
);
app.use(rateLimiter);
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post("/api/v1/payments/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const rawBody = req.rawBody as string;

  if (!signature || !rawBody) {
    res.status(400).json({ error: "Missing signature or body" });
    return;
  }

  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET ?? "";
  if (!webhookSecret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "payment.captured") {
    res.json({ status: "ignored" });
    return;
  }

  const razorpayOrderId = event.payload.payment.entity.order_id;
  const razorpayPaymentId = event.payload.payment.entity.id;

  try {
    await db.transaction(async (tx) => {
      const [payment] = await tx
        .update(payments)
        .set({
          razorpayPaymentId,
          status: "PAID",
        })
        .where(eq(payments.razorpayOrderId, razorpayOrderId))
        .returning();

      if (!payment) {
        throw new Error("Payment not found");
      }

      await tx
        .update(orders)
        .set({ paymentStatus: "PAID" })
        .where(eq(orders.id, payment.orderId));
    });

    res.json({ status: "ok" });
  } catch (err) {
    logger.error(err, "Webhook processing failed");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(routes);

app.use(errorHandler);

export default app;
