import * as favoritesRepository from "../repositories/favorites.repository";

export async function toggleFavorite(userId: string, restaurantId: string) {
  const existing = await favoritesRepository.findFavorite(userId, restaurantId);

  if (existing) {
    await favoritesRepository.removeFavorite(userId, restaurantId);
    return { favorited: false };
  }

  await favoritesRepository.addFavorite(userId, restaurantId);
  return { favorited: true };
}

export async function getFavorites(userId: string) {
  const result = await favoritesRepository.getUserFavorites(userId);

  return result.map((item) => ({
    id: item.favorites.id,
    userId: item.favorites.userId,
    restaurantId: item.favorites.restaurantId,
    restaurant: item.restaurants,
  }));
}
