import * as Z from "zod";

export const signUpSchema = Z.object({
  email: Z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: Z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
  name: Z.string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must not exceed 50 characters" }),
  username: Z.string()
    .min(1, { message: "Username is required" })
    .max(30, { message: "Username must not exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
});

export type SignUpSchema = Z.infer<typeof signUpSchema>;