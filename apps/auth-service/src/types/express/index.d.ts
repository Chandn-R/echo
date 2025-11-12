import { users } from "@repo/db";
import type { User } from "@repo/db";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}