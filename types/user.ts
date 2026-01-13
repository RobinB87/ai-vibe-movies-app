export interface User {
  id: number;
  email: string;
  name: string;
  password?: string; // Password is included here for completeness, but typically wouldn't be sent to frontend. Made optional.
}
