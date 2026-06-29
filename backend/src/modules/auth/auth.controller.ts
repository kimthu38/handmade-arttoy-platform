import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google — no body needed
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(
    @Req() req: { user: User },
    @Res() res: Response,
  ) {
    const token = this.authService.buildTokenForUser(req.user);
    const frontendUrl = this.config.get<string>('FRONTEND_BUYER_URL');
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // ─── Facebook OAuth ───────────────────────────────────────────────────────

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {
    // Passport redirects to Facebook — no body needed
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookCallback(
    @Req() req: { user: User },
    @Res() res: Response,
  ) {
    const token = this.authService.buildTokenForUser(req.user);
    const frontendUrl = this.config.get<string>('FRONTEND_BUYER_URL');
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
