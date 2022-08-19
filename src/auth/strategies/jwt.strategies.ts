import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    console.log(payload);
    const { id } = payload;
    if (!id) throw new UnauthorizedException("Credentials don't match");
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('User is not active');
    return user;
  }
}
