# Order Lifecycle

## Create Order

Cart

↓

Checkout

↓

Payment

↓

Order Created

↓

PENDING

---

## Restaurant Accepts

PENDING

↓

RESTAURANT_ACCEPTED

---

## Food Preparation

RESTAURANT_ACCEPTED

↓

PREPARING

---

## Pickup Ready

PREPARING

↓

READY_FOR_PICKUP

---

## Delivery Partner

READY_FOR_PICKUP

↓

PICKED_UP

↓

OUT_FOR_DELIVERY

↓

DELIVERED

---

## Cancellation

Allowed:

PENDING

RESTAURANT_ACCEPTED

Not Allowed:

PICKED_UP

OUT_FOR_DELIVERY

DELIVERED

---

## Notification Triggers

PENDING

→ Order placed

RESTAURANT_ACCEPTED

→ Restaurant accepted order

PREPARING

→ Food is being prepared

OUT_FOR_DELIVERY

→ Driver is on the way

DELIVERED

→ Order delivered
