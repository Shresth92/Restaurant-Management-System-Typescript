export {};

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

declare global {
  namespace Express {
    export interface Request {
      setrole?: Role;
      created_by?: string;
      session_id?: string;
      role?: Role;
      id?: string;
    }
  }
}
