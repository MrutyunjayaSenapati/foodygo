import { z } from "zod";

export const toggleFavoriteSchema = z.object({
  restaurantId: z.string().uuid(),
});
