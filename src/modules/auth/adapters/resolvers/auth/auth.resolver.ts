import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { RegisterUseCase } from "src/modules/auth/application/use-cases/register.use-case";
import { LoginUseCase } from "src/modules/auth/application/use-cases/login.use-case";
import { RegisterInputDTO } from "src/modules/auth/adapters/dtos/register-input/register-input.dto";
import { AuthPayload } from "src/modules/auth/adapters/dtos/auth-payload/auth-payload";
import { LoginInputDTO } from "../../dtos/login-input/login-input.dto";

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Mutation(() => AuthPayload)
  async register(@Args("input") input: RegisterInputDTO): Promise<AuthPayload> {
    const user = await this.registerUseCase.execute(input);

    return this.registerUseCase.execute({
      username: user.username,
      password: user.password,
      email: user.email,
      displayName: user.displayName,
    });
  }

  @Mutation(() => AuthPayload)
  async login(@Args("input") input: LoginInputDTO): Promise<AuthPayload> {
    return this.loginUseCase.execute(input);
  }
}