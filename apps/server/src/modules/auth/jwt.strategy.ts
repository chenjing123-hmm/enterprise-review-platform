import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '@erp/shared';
import { AuthService } from './auth.service';

/**
 * JWT 策略 - Passport JWT 验证
 * 从请求头 Authorization: Bearer <token> 中提取 JWT 并验证
 * 验证通过后，将用户信息挂载到 request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // 从 Authorization Bearer 头中提取 token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 是否忽略过期验证
      ignoreExpiration: false,
      // JWT 密钥
      secretOrKey: configService.get('JWT_SECRET', 'change-me-in-production'),
    });
  }

  /**
   * 验证 JWT Payload 并返回用户信息
   * 此方法会在每次请求时被 Passport 调用
   * @param payload JWT 解析后的 payload
   * @returns RequestUser 用户信息，挂载到 request.user
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    this.logger.debug(`[JWT验证] 用户ID: ${payload.sub}, 角色: ${payload.role}`);

    // 从数据库验证用户是否仍然有效
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      this.logger.warn(`[JWT验证失败] 用户不存在或已被禁用: ${payload.sub}`);
      throw new UnauthorizedException('用户不存在或已被禁用，请重新登录');
    }

    // 返回的用户信息将被挂载到 request.user
    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      realNameVerified: user.realNameVerified,
      nickname: user.nickname,
    };
  }
}