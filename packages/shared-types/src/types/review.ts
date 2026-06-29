export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface CreateReviewDTO {
  restaurantId: string;
  rating: number;
  comment?: string;
}
