import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { SingUpDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signupInfo: SingUpDto) {
    return this.authService.signup(signupInfo);
  }
}
