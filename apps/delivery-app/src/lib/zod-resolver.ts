import { zodResolver as originalZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod/v4";

export function zodResolver<T extends z.ZodTypeAny>(
  schema: T,
): Resolver<z.input<T> & FieldValues, unknown, z.output<T>> {
  return originalZodResolver(
    schema as unknown as Parameters<typeof originalZodResolver>[0],
  ) as unknown as Resolver<
    z.input<T> & FieldValues,
    unknown,
    z.output<T>
  >;
}
