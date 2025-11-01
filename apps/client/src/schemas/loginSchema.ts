import * as Z from "zod";

export const loginSchema = Z.object({
  email: Z.string().email("Invalid email address"),
  password: Z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
});

export type LoginSchema = Z.infer<typeof loginSchema>;
