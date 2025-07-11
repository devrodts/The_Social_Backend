import { User } from "src/modules/users/domain/entity/user.entity";

export interface AuthRepository{
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    createUser(user: User): Promise<User>;
    updateUser(user: User): Promise<User>;
    deleteUser(id: string): Promise<void>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
    findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
}