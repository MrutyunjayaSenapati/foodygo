import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { AppError } from "../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

const storage = process.env.VERCEL
  ? multer.memoryStorage()
  : (() => {
      const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(path.join(UPLOADS_DIR, "restaurants"), { recursive: true });
      }
      return multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, path.join(UPLOADS_DIR, "restaurants"));
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${crypto.randomUUID()}${ext}`);
        },
      });
    })();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(ErrorCode.VALIDATION_ERROR, "Only .jpg, .jpeg, .png, .pdf files are allowed"));
  }
};

const _upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("document");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function uploadDocument(req: any, res: any, next: any): void {
  _upload(req, res, next);
}
