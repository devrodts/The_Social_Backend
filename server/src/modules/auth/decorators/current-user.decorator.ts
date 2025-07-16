
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/modules/users/entity/user.entity';

export function extractCurrentUserFromContext(context: ExecutionContext): User | null | undefined {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;
  return request?.user;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User | null | undefined => {
    return extractCurrentUserFromContext(context);
  },
);
