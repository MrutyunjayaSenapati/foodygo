import { z } from "zod";
import type { Resolver } from "react-hook-form";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(255),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

function safeFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, { message: string; type?: string }> = {};
  for (const issue of issues) {
    const path = issue.path.map((p) => String(p)).join(".");
    if (path && !errors[path]) {
      errors[path] = { message: issue.message };
    }
  }
  return errors;
}

export const loginResolver: Resolver<LoginFormData> = async (values) => {
  const result = loginSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as LoginFormData, errors: {} };
  }
  return { values: {} as Record<string, never>, errors: safeFieldErrors(result.error.issues) };
};

export const registerResolver: Resolver<RegisterFormData> = async (values) => {
  const result = registerSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as RegisterFormData, errors: {} };
  }
  return { values: {} as Record<string, never>, errors: safeFieldErrors(result.error.issues) };
};
