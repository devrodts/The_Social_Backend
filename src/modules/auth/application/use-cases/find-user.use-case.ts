import { Injectable } from "@nestjs/common";
import { UUID } from "crypto";
import { UserRepository } from "src/modules/users/domain/repository/user.repository";

@Injectable()
export class FindUserUseCase{
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async execute(userId:UUID){
        const user = await this.userRepository.findById(userId); 
        if(!user) throw new Error("User not find") 
        return user;
    }   
}