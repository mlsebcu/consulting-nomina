import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // POST /auth/login
    @Public()
    @Post('login')
    login(@Body() dto: LoginDto){
        return this.authService.login(dto.nombreUsuario, dto.password);
    }
}
