export interface FoodCategory {
  id: string;
  restaurantId: string;
  name: string;
}

export interface Food {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
}

export interface CreateFoodCategoryDTO {
  name: string;
}

export interface CreateFoodDTO {
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

export interface UpdateFoodDTO {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isAvailable?: boolean;
  categoryId?: string;
}
