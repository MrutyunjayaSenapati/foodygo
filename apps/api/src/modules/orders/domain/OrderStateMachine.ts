import { ALLOWED_TRANSITIONS, CANCELLABLE_STATUSES, ErrorCode } from "@foodygo/shared-constants";
import { OrderStatus } from "@foodygo/shared-types";

export class InvalidTransitionError extends Error {
  constructor(current: OrderStatus, target: OrderStatus) {
    super(`Cannot transition from ${current} to ${target}`);
    this.name = "InvalidTransitionError";
  }

  toErrorCode() {
    return ErrorCode.INVALID_STATUS_TRANSITION;
  }
}

export class OrderStateMachine {
  constructor(private currentStatus: OrderStatus) {}

  canTransitionTo(target: OrderStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[this.currentStatus];
    return allowed.includes(target);
  }

  transitionTo(target: OrderStatus): void {
    if (!this.canTransitionTo(target)) {
      throw new InvalidTransitionError(this.currentStatus, target);
    }
  }

  isCancellable(): boolean {
    return CANCELLABLE_STATUSES.includes(this.currentStatus);
  }

  getCurrentStatus(): OrderStatus {
    return this.currentStatus;
  }
}
