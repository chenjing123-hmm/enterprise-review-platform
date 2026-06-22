import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtTokenResponse } from '@erp/shared';

/**
 * 认证控制器
 * 提供用户注册、登录、短信验证码、Token 刷新等接口
 * 所有接口均为公开路由（无需认证）
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/send-sms
   * 发送短信验证码
   * Body: { phone: string }
   */
  @Public()
  @Post('send-sms')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() body: { phone: string }) {
    return this.authService.sendSmsCode(body.phone);
  }

  /**
   * POST /api/auth/register
   * 用户注册
   * Body: { phone, smsCode, password, nickname, realName?, idCard? }
   * 真实姓名和身份证号使用 AES-256-CBC 加密存储
   * 手机号使用 SHA256 哈希存储
   */
  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      phone: string;
      smsCode: string;
      password: string;
      nickname: string;
      realName?: string;
      idCard?: string;
    },
  ) {
    return this.authService.register(body);
  }

  /**
   * POST /api/auth/login
   * 用户登录
   * Body: { phone, password }
   * 返回: { accessToken, refreshToken, expiresIn }
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { phone: string; password: string },
  ): Promise<JwtTokenResponse> {
    return this.authService.login(body);
  }

  /**
   * POST /api/auth/refresh
   * 刷新 Access Token
   * Body: { refreshToken: string }
   * 返回: { accessToken, refreshToken, expiresIn }
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { refreshToken: string },
  ): Promise<JwtTokenResponse> {
    return this.authService.refreshToken(body.refreshToken);
  }
}