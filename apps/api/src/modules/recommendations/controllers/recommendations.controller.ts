import type { Request, Response } from "express";
import { getRecommendations } from "../services/recommendations.service";
import { sendSuccess } from "../../../utils/response";

export const list = async (req: Request, res: Response) => {
  const result = await getRecommendations(req.user!.userId);
  sendSuccess(res, result);
};
