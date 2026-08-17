import "dotenv/config";
import { hash } from "argon2";
import { eq, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { roles } from "./schema/roles";
import { users } from "./schema/users";
import { userRoles } from "./schema/user-roles";
import { restaurants } from "./schema/restaurants";
import { foodCategories } from "./schema/food-categories";
import { foods } from "./schema/foods";
import { deliveryPartners } from "./schema/delivery-partners";
import { favorites } from "./schema/favorites";
import { addresses } from "./schema/addresses";
import { reviews } from "./schema/reviews";
import { globalFoods } from "./schema/global-foods";

const SEED_ROLES = ["CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"];

async function seed() {
  console.log("[seed] Seeding roles...");
  for (const name of SEED_ROLES) {
    await db.insert(roles).values({ name }).onConflictDoNothing();
  }
  const roleRows = await db.select().from(roles);
  const roleMap = roleRows.reduce(
    (acc, r) => { acc[r.name] = r.id; return acc; },
    {} as Record<string, number>,
  );

  console.log("[seed] Seeding users...");
  const passwordHash = await hash("password123");

  for (const u of [
    { email: "test@foodygo.com", fullName: "Test Customer" },
    { email: "owner@foodygo.com", fullName: "Restaurant Owner" },
    { email: "partner@foodygo.com", fullName: "Delivery Partner" },
    { email: "admin@foodygo.com", fullName: "Admin User" },
  ]) {
    await db
      .insert(users)
      .values({ ...u, passwordHash })
      .onConflictDoNothing({ target: users.email });
  }

  const userRows = await db.select().from(users);
  const userMap = userRows.reduce(
    (acc, u) => { acc[u.email] = u; return acc; },
    {} as Record<string, (typeof userRows)[number]>,
  );

  console.log("[seed] Assigning roles...");
  const roleAssignments = [
    { userId: userMap["test@foodygo.com"]!.id, roleId: roleMap["CUSTOMER"]! },
    { userId: userMap["owner@foodygo.com"]!.id, roleId: roleMap["RESTAURANT_OWNER"]! },
    { userId: userMap["partner@foodygo.com"]!.id, roleId: roleMap["DELIVERY_PARTNER"]! },
    { userId: userMap["admin@foodygo.com"]!.id, roleId: roleMap["ADMIN"]! },
  ];
  for (const ra of roleAssignments) {
    await db.insert(userRoles).values(ra).onConflictDoNothing();
  }

  console.log("[seed] Seeding delivery partner profile...");
  await db.insert(deliveryPartners).values({
    userId: userMap["partner@foodygo.com"]!.id,
    vehicleType: "BIKE",
    licenseNumber: "DL-1234-5678",
  }).onConflictDoNothing();

  console.log("[seed] Seeding restaurants...");
  const existingPizza = await db.select().from(restaurants)
    .where(eq(restaurants.name, "Pizza Paradise"))
    .limit(1);

  const pizzaRestaurant = existingPizza.at(0) ?? (
    await db.insert(restaurants).values({
      ownerUserId: userMap["owner@foodygo.com"]!.id,
      name: "Pizza Paradise",
      description: "Authentic Italian pizzas made with fresh ingredients",
      logoUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      phone: "+1-555-0100",
      email: "hello@pizzaparadise.com",
      address: "123 Main St, New York, NY 10001",
      latitude: "40.7128",
      longitude: "-74.0060",
      rating: "4.5",
      status: "APPROVED",
    }).returning()
  ).at(0)!;

  const existingSushi = await db.select().from(restaurants)
    .where(eq(restaurants.name, "Sushi Master"))
    .limit(1);

  const sushiRestaurant = existingSushi.at(0) ?? (
    await db.insert(restaurants).values({
      ownerUserId: userMap["owner@foodygo.com"]!.id,
      name: "Sushi Master",
      description: "Premium Japanese sushi and sashimi",
      logoUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=400&q=80",
      coverUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
      phone: "+1-555-0200",
      email: "hello@sushimaster.com",
      address: "456 Oak Ave, New York, NY 10002",
      latitude: "40.7282",
      longitude: "-73.9942",
      rating: "4.8",
      status: "APPROVED",
    }).returning()
  ).at(0)!;

  console.log("[seed] Seeding food categories...");
  const catData = [
    { restaurantId: pizzaRestaurant.id, name: "Pizzas" },
    { restaurantId: pizzaRestaurant.id, name: "Sides" },
    { restaurantId: sushiRestaurant.id, name: "Sushi Rolls" },
    { restaurantId: sushiRestaurant.id, name: "Appetizers" },
  ];

  const catMap = new Map<string, typeof foodCategories.$inferSelect>();
  for (const c of catData) {
    const existing = await db.select().from(foodCategories)
      .where(eq(foodCategories.name, c.name))
      .limit(1);
    const cat = existing.at(0) ?? (await db.insert(foodCategories).values(c).returning()).at(0)!;
    catMap.set(c.name, cat);
  }

  console.log("[seed] Seeding foods...");
  const foodData = [
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "Margherita", imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80", description: "Fresh mozzarella, tomato sauce, basil", price: "12.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "Pepperoni", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80", description: "Pepperoni, mozzarella, tomato sauce", price: "14.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "BBQ Chicken", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80", description: "Grilled chicken, BBQ sauce, red onions, cilantro", price: "16.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Sides")!.id, name: "Garlic Bread", imageUrl: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=800&q=80", description: "Toasted bread with garlic butter and herbs", price: "4.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Sides")!.id, name: "Caesar Salad", imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80", description: "Romaine lettuce, croutons, parmesan, caesar dressing", price: "6.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "California Roll", imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80", description: "Crab, avocado, cucumber", price: "8.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "Spicy Tuna Roll", imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80", description: "Fresh tuna, spicy mayo, cucumber", price: "10.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "Salmon Nigiri (2 pcs)", imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80", description: "Fresh salmon over seasoned rice", price: "7.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Appetizers")!.id, name: "Edamame", imageUrl: "https://images.unsplash.com/photo-1583032015879-67d710c0e86b?auto=format&fit=crop&w=800&q=80", description: "Steamed soy beans with sea salt", price: "4.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Appetizers")!.id, name: "Miso Soup", imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", description: "Traditional miso with tofu and seaweed", price: "3.99" },
  ];

  for (const f of foodData) {
    await db.insert(foods).values(f).onConflictDoNothing();
  }

  console.log("[seed] Seeding favorite...");
  await db.insert(favorites).values({
    userId: userMap["test@foodygo.com"]!.id,
    restaurantId: pizzaRestaurant.id,
  }).onConflictDoNothing();

  console.log("[seed] Seeding address...");
  await db.insert(addresses).values({
    userId: userMap["test@foodygo.com"]!.id,
    label: "Home",
    addressLine1: "789 Broadway",
    city: "New York",
    state: "NY",
    postalCode: "10003",
    latitude: "40.7312",
    longitude: "-73.9926",
  }).onConflictDoNothing();

  console.log("[seed] Seeding review...");
  await db.insert(reviews).values({
    userId: userMap["test@foodygo.com"]!.id,
    restaurantId: pizzaRestaurant.id,
    rating: 5,
    comment: "Amazing pizza! Best in town.",
  }).onConflictDoNothing();

  console.log("[seed] Deduplicating foods...");
  await db.execute(sql.raw(`
    DELETE FROM foods a USING foods b
    WHERE a.id > b.id AND a.name = b.name AND a.restaurant_id = b.restaurant_id
  `));

  console.log("[seed] Updating restaurant images on existing rows...");
  await db.update(restaurants).set({
    logoUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  }).where(eq(restaurants.name, "Pizza Paradise"));

  await db.update(restaurants).set({
    logoUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
  }).where(eq(restaurants.name, "Sushi Master"));

  console.log("[seed] Updating food images on existing rows...");
  for (const f of foodData) {
    await db.update(foods).set({
      imageUrl: f.imageUrl,
      description: f.description,
    }).where(eq(foods.name, f.name));

    try {
      await db.update(globalFoods).set({
        imageUrl: f.imageUrl,
        description: f.description,
      }).where(eq(globalFoods.name, f.name));
    } catch {
      // ignore if globalFoods table is empty
    }
  }

  console.log("[seed] Done!");
  console.log("");
  console.log("Test credentials:");
  console.log("  Customer:       test@foodygo.com / password123");
  console.log("  Owner:          owner@foodygo.com / password123");
  console.log("  Delivery:       partner@foodygo.com / password123");
  console.log("  Admin:          admin@foodygo.com / password123");
  console.log("");
  console.log("Restaurants: Pizza Paradise, Sushi Master");
  console.log("Customer has 1 favorite (Pizza Paradise), 1 address, and 1 review");

  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
