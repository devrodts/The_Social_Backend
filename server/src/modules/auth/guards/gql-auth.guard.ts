import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: Request }>();
    return req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }
    const request = this.getRequest(context) as any;
    const payload = request.user as any;
    if (!payload || !payload.userId) {
      throw new UnauthorizedException();
    }
    try {
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user) {
        throw new UnauthorizedException();
      }
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
