import { User } from "../entity/user.entity";

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(user: User): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  saveUser(user: User): Promise<User>;
  findUserById(userId: string): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
}
