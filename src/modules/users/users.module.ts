// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersResolver,
    UsersService,
    CreateUserUseCase,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}