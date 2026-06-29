import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      clientID: config.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: config.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: config.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value ?? `fb_${profile.id}@placeholder.com`;
    const firstName = (profile.name as { givenName?: string })?.givenName ?? '';
    const lastName = (profile.name as { familyName?: string })?.familyName ?? '';
    const avatar_url = profile.photos?.[0]?.value ?? undefined;

    return this.authService.findOrCreateOAuthUser({
      provider: 'facebook',
      provider_id: profile.id,
      email,
      full_name: `${firstName} ${lastName}`.trim() || profile.displayName,
      avatar_url,
    });
  }
}
