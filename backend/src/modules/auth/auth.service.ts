import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface OAuthUserPayload {
  provider: string;
  provider_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface AuthResult {
  access_token: string;
  user: Omit<User, 'password_hash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash,
        full_name: dto.full_name,
        provider: 'local',
      },
    });

    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.buildAuthResult(user);
  }

  async findOrCreateOAuthUser(payload: OAuthUserPayload): Promise<User> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: payload.provider, provider_id: payload.provider_id },
          { email: payload.email },
        ],
      },
    });

    if (existing) {
      // Update provider info if signing in via OAuth for the first time on an existing email
      if (!existing.provider_id) {
        return this.prisma.user.update({
          where: { id: existing.id },
          data: {
            provider: payload.provider,
            provider_id: payload.provider_id,
            avatar_url: payload.avatar_url ?? existing.avatar_url,
          },
        });
      }
      return existing;
    }

    return this.prisma.user.create({
      data: {
        email: payload.email,
        full_name: payload.full_name,
        avatar_url: payload.avatar_url,
        provider: payload.provider,
        provider_id: payload.provider_id,
      },
    });
  }

  buildTokenForUser(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private buildAuthResult(user: User): AuthResult {
    const { password_hash: _, ...safeUser } = user;
    return {
      access_token: this.buildTokenForUser(user),
      user: safeUser,
    };
  }
}
