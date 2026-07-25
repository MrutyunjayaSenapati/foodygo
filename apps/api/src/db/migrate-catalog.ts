import "dotenv/config";
import { db } from "../lib/db";
import { restaurants } from "./schema/restaurants";
import { foodCategories } from "./schema/food-categories";
import { foods } from "./schema/foods";
import { globalCategories } from "./schema/global-categories";
import { globalFoods } from "./schema/global-foods";
import { eq, and, isNull } from "drizzle-orm";

async function migrateCatalog() {
  console.log("[migrate-catalog] Finding Pizza Paradise...");
  const pizzaRestaurant = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.name, "Pizza Paradise"))
    .limit(1);

  if (!pizzaRestaurant[0]) {
    console.log("[migrate-catalog] Pizza Paradise not found. Run seed first.");
    process.exit(0);
  }

  const restaurant = pizzaRestaurant[0];

  console.log("[migrate-catalog] Fetching Pizza Paradise categories...");
  const cats = await db
    .select()
    .from(foodCategories)
    .where(eq(foodCategories.restaurantId, restaurant.id));

  const catIdMap = new Map<string, string>();

  for (const cat of cats) {
    const existingGlobal = await db
      .select()
      .from(globalCategories)
      .where(eq(globalCategories.name, cat.name))
      .limit(1);

    let globalCat = existingGlobal[0];
    if (!globalCat) {
      const result = await db
        .insert(globalCategories)
        .values({ name: cat.name, description: null, imageUrl: null, isActive: true })
        .returning();
      globalCat = result[0]!;
      console.log(`[migrate-catalog] Created global category: ${cat.name}`);
    }

    catIdMap.set(cat.id, globalCat.id);
  }

  console.log("[migrate-catalog] Fetching Pizza Paradise foods...");
  const pizzaFoods = await db
    .select()
    .from(foods)
    .where(and(eq(foods.restaurantId, restaurant.id), isNull(foods.deletedAt)));

  for (const food of pizzaFoods) {
    if (food.globalFoodId) {
      console.log(`[migrate-catalog] Food "${food.name}" already has globalFoodId, skipping`);
      continue;
    }

    const globalCatId = food.categoryId ? catIdMap.get(food.categoryId) : null;

    const existingGlobal = await db
      .select()
      .from(globalFoods)
      .where(eq(globalFoods.name, food.name))
      .limit(1);

    let globalFood = existingGlobal[0];
    if (!globalFood) {
      const result = await db
        .insert(globalFoods)
        .values({
          categoryId: globalCatId ?? null,
          name: food.name,
          description: food.description,
          imageUrl: food.imageUrl,
          isAvailable: true,
        })
        .returning();
      globalFood = result[0]!;
      console.log(`[migrate-catalog] Created global food: ${food.name}`);
    }

    const catalogSnapshot = {
      name: globalFood.name,
      description: globalFood.description,
      imageUrl: globalFood.imageUrl,
    };

    await db
      .update(foods)
      .set({
        globalFoodId: globalFood.id,
        catalogSnapshot,
      })
      .where(eq(foods.id, food.id));

    console.log(`[migrate-catalog] Linked food "${food.name}" to global catalog`);
  }

  console.log("[migrate-catalog] Done!");
  process.exit(0);
}

migrateCatalog().catch((err) => {
  console.error("[migrate-catalog] Failed:", err);
  process.exit(1);
});
