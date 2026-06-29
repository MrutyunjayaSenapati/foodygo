export interface ListRestaurantsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  cuisine?: string;
  priceMin?: number;
  priceMax?: number;
}
