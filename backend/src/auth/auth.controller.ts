import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
  login(@Body() body: LoginBody) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordBody) {
    return this.authService.requestPasswordRecovery(body);
  }

  @Post('google')
  loginWithGoogle(@Body() body: GoogleLoginBody) {
    return this.authService.loginWithGoogle(body);
  }
}
