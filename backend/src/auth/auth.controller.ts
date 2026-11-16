import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { clearSessionCookies, setSessionCookies } from './session-cookies';
import { JwtAuthGuard } from './JwtAuthGuard';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.issueSession(response, await this.authService.login(body));
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordRecovery(body);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('google')
  @UseGuards(ThrottlerGuard)
  async loginWithGoogle(
    @Body() body: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.issueSession(
      response,
      await this.authService.loginWithGoogle(body),
    );
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  getSession(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Session responses must never be reused or conditionally answered with 304.
    request.headers['cache-control'] = 'no-cache';
    response.setHeader('Cache-Control', 'no-store, private');
    return this.authService.getCurrentSession(request.user.sub);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    clearSessionCookies(response);
    return { message: 'La sesion se cerro correctamente.' };
  }

  private issueSession(
    response: Response,
    session: { token: string; user: unknown; expiresAt: number },
  ) {
    setSessionCookies(response, session.token);
    return { user: session.user, expiresAt: session.expiresAt };
  }
}
