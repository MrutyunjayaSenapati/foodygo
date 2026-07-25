export interface GlobalCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface GlobalFood {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface AddFromCatalogDTO {
  globalFoodId: string;
  price: number;
  categoryId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateGlobalCategoryDTO {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateGlobalCategoryDTO {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateGlobalFoodDTO {
  categoryId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateGlobalFoodDTO {
  categoryId?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}
