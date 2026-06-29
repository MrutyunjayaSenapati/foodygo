import { describe, it, expect } from "vitest";
import { OrderStatus } from "@foodygo/shared-types";
import { OrderStateMachine, InvalidTransitionError } from "../domain/OrderStateMachine";

describe("OrderStateMachine", () => {
  describe("PENDING", () => {
    const sm = new OrderStateMachine(OrderStatus.PENDING);

    it("can transition to RESTAURANT_ACCEPTED", () => {
      expect(sm.canTransitionTo(OrderStatus.RESTAURANT_ACCEPTED)).toBe(true);
    });

    it("can transition to CANCELLED", () => {
      expect(sm.canTransitionTo(OrderStatus.CANCELLED)).toBe(true);
    });

    it("cannot skip to DELIVERED", () => {
      expect(sm.canTransitionTo(OrderStatus.DELIVERED)).toBe(false);
    });

    it("is cancellable", () => {
      expect(sm.isCancellable()).toBe(true);
    });
  });

  describe("RESTAURANT_ACCEPTED", () => {
    const sm = new OrderStateMachine(OrderStatus.RESTAURANT_ACCEPTED);

    it("can transition to PREPARING", () => {
      expect(sm.canTransitionTo(OrderStatus.PREPARING)).toBe(true);
    });

    it("can transition to CANCELLED", () => {
      expect(sm.canTransitionTo(OrderStatus.CANCELLED)).toBe(true);
    });

    it("is cancellable", () => {
      expect(sm.isCancellable()).toBe(true);
    });
  });

  describe("DELIVERED", () => {
    const sm = new OrderStateMachine(OrderStatus.DELIVERED);

    it("cannot transition anywhere", () => {
      expect(sm.canTransitionTo(OrderStatus.CANCELLED)).toBe(false);
      expect(sm.canTransitionTo(OrderStatus.PENDING)).toBe(false);
    });

    it("is not cancellable", () => {
      expect(sm.isCancellable()).toBe(false);
    });
  });

  describe("CANCELLED", () => {
    const sm = new OrderStateMachine(OrderStatus.CANCELLED);

    it("cannot be uncancelled", () => {
      expect(sm.canTransitionTo(OrderStatus.PENDING)).toBe(false);
    });

    it("is final state", () => {
      expect(() => sm.transitionTo(OrderStatus.PREPARING)).toThrow(InvalidTransitionError);
    });
  });

  describe("transitionTo", () => {
    it("allows valid transitions", () => {
      const sm = new OrderStateMachine(OrderStatus.PREPARING);
      expect(() => sm.transitionTo(OrderStatus.READY_FOR_PICKUP)).not.toThrow();
    });

    it("throws on invalid transitions", () => {
      const sm = new OrderStateMachine(OrderStatus.PENDING);
      expect(() => sm.transitionTo(OrderStatus.DELIVERED)).toThrow(InvalidTransitionError);
    });
  });
});
