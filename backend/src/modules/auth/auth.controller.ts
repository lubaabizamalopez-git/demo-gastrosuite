import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { correo: string; clave: string }) {
    return this.authService.login(body.correo, body.clave);
  }

  @Post('login-pin')
  async loginPin(@Body() body: { pin: string }) {
    return this.authService.loginConPin(body.pin);
  }
}
