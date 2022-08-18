export {};

declare global {
  enum Role {
    user = "user",
    admin = "admin",
    subadmin = "subadmin",
  }
  namespace Express {
    interface Request {
      setrole?: Role;
      created_by?: string;
      session_id?: string;
      role?: Role;
      id?: string;
    }
  }
}
