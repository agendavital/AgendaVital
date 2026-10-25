import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type ForgotPasswordBody = {
  email?: unknown;
};

type GoogleLoginBody = {
  credential?: unknown;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  login(@Body() body: LoginBody) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  forgotPassword(@Body() body: ForgotPasswordBody) {
    return this.authService.requestPasswordRecovery(body);
  }

  @Post('google')
  loginWithGoogle(@Body() body: GoogleLoginBody) {
    return this.authService.loginWithGoogle(body);
  }
}
