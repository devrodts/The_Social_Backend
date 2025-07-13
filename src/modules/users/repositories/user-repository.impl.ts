import { User } from "../entity/user.entity";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    return await this.userRepository.findUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail( email );
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async createUser(user: User): Promise<User> {
    const newUser = await this.userRepository.createUser(user);
    await this.userRepository.saveUser(newUser);
    return user;
  }

  async updateUser(user: User): Promise<User> {
    const updatedUser = await this.userRepository.updateUser(user);
    return  updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.deleteUser(id);
    return result;
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.findAllUsers();
  }


  async saveUser(user: User): Promise<User> {
      const userToSave = await this.userRepository.saveUser(user);
      return userToSave;
  }
}