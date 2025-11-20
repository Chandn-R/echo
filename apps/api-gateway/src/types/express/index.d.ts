interface UserPayload {
  userId: string;
}

declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}