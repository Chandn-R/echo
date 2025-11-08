interface UserPayload {
  id: string;
}

declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}