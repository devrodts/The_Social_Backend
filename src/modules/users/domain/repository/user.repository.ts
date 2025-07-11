import { User } from "../entity/user.entity";

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(userId: string): Promise<void>;
  save(user: User): Promise<User>;
  findById(userId: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}
