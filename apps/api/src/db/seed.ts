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
      logoUrl: "https://placehold.co/200x200/FF6B35/white?text=PP",
      coverUrl: "https://placehold.co/800x400/FF6B35/white?text=Pizza+Paradise",
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
      logoUrl: "https://placehold.co/200x200/004E89/white?text=SM",
      coverUrl: "https://placehold.co/800x400/004E89/white?text=Sushi+Master",
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
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "Margherita", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Margherita", description: "Fresh mozzarella, tomato sauce, basil", price: "12.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "Pepperoni", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Pepperoni", description: "Pepperoni, mozzarella, tomato sauce", price: "14.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Pizzas")!.id, name: "BBQ Chicken", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=BBQ+Chicken", description: "Grilled chicken, BBQ sauce, red onions, cilantro", price: "16.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Sides")!.id, name: "Garlic Bread", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Garlic+Bread", description: "Toasted bread with garlic butter and herbs", price: "4.99" },
    { restaurantId: pizzaRestaurant.id, categoryId: catMap.get("Sides")!.id, name: "Caesar Salad", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Caesar+Salad", description: "Romaine lettuce, croutons, parmesan, caesar dressing", price: "6.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "California Roll", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=California+Roll", description: "Crab, avocado, cucumber", price: "8.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "Spicy Tuna Roll", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Spicy+Tuna+Roll", description: "Fresh tuna, spicy mayo, cucumber", price: "10.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Sushi Rolls")!.id, name: "Salmon Nigiri (2 pcs)", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Salmon+Nigiri", description: "Fresh salmon over seasoned rice", price: "7.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Appetizers")!.id, name: "Edamame", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Edamame", description: "Steamed soy beans with sea salt", price: "4.99" },
    { restaurantId: sushiRestaurant.id, categoryId: catMap.get("Appetizers")!.id, name: "Miso Soup", imageUrl: "https://placehold.co/400x300/E5E5EA/333?text=Miso+Soup", description: "Traditional miso with tofu and seaweed", price: "3.99" },
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
    logoUrl: "https://placehold.co/200x200/FF6B35/white?text=PP",
    coverUrl: "https://placehold.co/800x400/FF6B35/white?text=Pizza+Paradise",
  }).where(eq(restaurants.name, "Pizza Paradise"));

  await db.update(restaurants).set({
    logoUrl: "https://placehold.co/200x200/004E89/white?text=SM",
    coverUrl: "https://placehold.co/800x400/004E89/white?text=Sushi+Master",
  }).where(eq(restaurants.name, "Sushi Master"));

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
