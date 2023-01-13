/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.token) {
      return null;
    }

    if (data) {
      return req.token[data];
    }

    return req.token;
  },
);
