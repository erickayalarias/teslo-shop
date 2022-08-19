import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  console.log('user', user);
  let dataFinal = {};
  if (!user) throw new InternalServerErrorException('User not found');
  for (let index = 0; index < data.length; index++) {
    dataFinal = {
      ...dataFinal,
      [data[index]]: user[data[index]],
    };
  }
  return dataFinal;
});
