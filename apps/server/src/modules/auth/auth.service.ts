import { Injectable, Logger, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { UserRole, UserStatus, JwtPayload, JwtTokenResponse, RequestUser } from '@erp/shared';

/**
 * 验证码存储（内存模拟，生产环境应使用 Redis）
 * key: 手机号 | value: { code, expiresAt }
 */
const smsCodeStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * 认证服务
 * 负责用户注册、登录、短信验证码、JWT Token 生成
 * 敏感数据: 真实姓名使用 AES-256-CBC 加密，手机号使用 SHA256 哈希
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly encryptionKey: Buffer;
  private readonly encryptionIvLength = 16; // AES-256-CBC IV 长度

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 从环境变量读取加密密钥（32字节）
    const key = this.configService.get<string>('APP_ENCRYPTION_KEY', 'change-me-32-byte-key-here-plz!!');
    this.encryptionKey = Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf-8');
  }

  // ==================== 短信验证码 ====================

  /**
   * 发送短信验证码（开发环境模拟，返回固定验证码 888888）
   * @param phone 手机号
   */
  async sendSmsCode(phone: string): Promise<{ success: boolean; message: string }> {
    const mockCode = '888888';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟有效

    // 检查是否在60秒内已发送
    const existing = smsCodeStore.get(phone);
    if (existing && Date.now() - existing.expiresAt + 5 * 60 * 1000 < 55000) {
      throw new BadRequestException('验证码发送过于频繁，请60秒后再试');
    }

    smsCodeStore.set(phone, { code: mockCode, expiresAt });
    this.logger.log(`[短信验证码] 手机号 ${this.maskPhone(phone)} 验证码: ${mockCode}`);

    return {
      success: true,
      message: '验证码已发送（开发环境验证码: ' + mockCode + '）',
    };
  }

  /**
   * 校验短信验证码
   */
  private verifySmsCode(phone: string, code: string): boolean {
    const stored = smsCodeStore.get(phone);
    if (!stored) {
      return false;
    }
    if (Date.now() > stored.expiresAt) {
      smsCodeStore.delete(phone);
      return false;
    }
    // 验证后清除验证码（一次性使用）
    if (stored.code === code) {
      smsCodeStore.delete(phone);
      return true;
    }
    return false;
  }

  // ==================== 加密工具 ====================

  /**
   * AES-256-CBC 加密
   * @param plainText 明文
   * @returns 格式: iv:encrypted (hex编码)
   */
  encrypt(plainText: string): string {
    const iv = randomBytes(this.encryptionIvLength);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(plainText, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * AES-256-CBC 解密
   * @param encryptedText 格式: iv:encrypted (hex编码)
   */
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('无效的加密数据格式');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  /**
   * SHA256 哈希（用于手机号存储）
   */
  hashPhone(phone: string): string {
    return createHash('sha256').update(phone).digest('hex');
  }

  // ==================== 用户注册 ====================

  /**
   * 用户注册
   * 密码使用 bcrypt 加密，真实姓名使用 AES-256-CBC 加密，手机号使用 SHA256 哈希
   */
  async register(dto: {
    phone: string;
    smsCode: string;
    password: string;
    nickname: string;
    realName?: string;
    idCard?: string;
  }): Promise<{ message: string }> {
    // 1. 校验短信验证码
    const isValid = this.verifySmsCode(dto.phone, dto.smsCode);
    if (!isValid) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 2. 手机号 SHA256 哈希
    const phoneHash = this.hashPhone(dto.phone);

    // 3. 检查手机号是否已注册（此处需要数据库查询，暂时模拟）
    // const existingUser = await this.userRepository.findOne({ where: { phoneHash } });
    // if (existingUser) {
    //   throw new ConflictException('该手机号已注册');
    // }

    // 4. 加密真实姓名
    const realNameEncrypted = dto.realName ? this.encrypt(dto.realName) : null;

    // 5. 加密身份证号
    const idCardEncrypted = dto.idCard ? this.encrypt(dto.idCard) : null;

    // 6. 密码 bcrypt 加密（此处简化，实际使用 bcrypt.hash）
    // const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 7. 创建用户（此处需要数据库操作，暂时模拟）
    // const user = this.userRepository.create({
    //   phoneHash,
    //   password: hashedPassword,
    //   nickname: dto.nickname,
    //   role: UserRole.USER,
    //   status: UserStatus.ACTIVE,
    //   realNameStatus: dto.realName ? RealNameStatus.PENDING : RealNameStatus.UNVERIFIED,
    //   realNameEncrypted,
    //   idCardEncrypted,
    // });
    // await this.userRepository.save(user);

    this.logger.log(`[注册] 用户注册成功: ${dto.nickname}, 手机号哈希: ${phoneHash.slice(0, 16)}...`);

    return {
      message: '注册成功',
    };
  }

  // ==================== 用户登录 ====================

  /**
   * 用户登录
   * 验证手机号密码，返回 JWT accessToken + refreshToken
   */
  async login(dto: {
    phone: string;
    password: string;
  }): Promise<JwtTokenResponse> {
    const phoneHash = this.hashPhone(dto.phone);

    // 查询用户（此处需要数据库操作，暂时模拟）
    // const user = await this.userRepository.findOne({
    //   where: { phoneHash },
    //   select: ['id', 'phoneHash', 'password', 'role', 'status', 'realNameStatus'],
    // });
    // if (!user) {
    //   throw new UnauthorizedException('手机号或密码错误');
    // }
    // if (user.status === UserStatus.DISABLED || user.status === UserStatus.BANNED) {
    //   throw new UnauthorizedException('账号已被禁用或封禁');
    // }
    // const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('手机号或密码错误');
    // }

    // 模拟用户数据（实际应从数据库读取）
    const mockUser = {
      id: 'mock-user-id',
      phoneHash,
      role: UserRole.USER,
      realNameVerified: false,
    };

    // 生成 accessToken 和 refreshToken
    const tokens = this.generateTokens({
      sub: mockUser.id,
      phone: mockUser.phoneHash,
      role: mockUser.role,
    });

    this.logger.log(`[登录] 用户登录成功: ${phoneHash.slice(0, 16)}...`);

    return tokens;
  }

  // ==================== Token 刷新 ====================

  /**
   * 刷新 Access Token
   * @param refreshToken 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<JwtTokenResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // 验证用户是否仍然存在且活跃（此处需要数据库查询）
      // const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      // if (!user || user.status !== UserStatus.ACTIVE) {
      //   throw new UnauthorizedException('用户不存在或已被禁用');
      // }

      return this.generateTokens({
        sub: payload.sub,
        phone: payload.phone,
        role: payload.role,
      });
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期，请重新登录');
    }
  }

  // ==================== Token 生成 ====================

  /**
   * 生成 JWT accessToken 和 refreshToken
   */
  private generateTokens(payload: { sub: string; phone: string; role: string }): JwtTokenResponse {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15分钟，单位秒
    };
  }

  // ==================== 用户查询 ====================

  /**
   * 根据用户ID获取用户信息（用于 JWT 策略验证）
   */
  async validateUserById(userId: string): Promise<RequestUser | null> {
    // 此处需要数据库查询，暂时返回模拟数据
    // const user = await this.userRepository.findOne({ where: { id: userId } });
    // if (!user || user.status !== UserStatus.ACTIVE) return null;
    // return {
    //   userId: user.id,
    //   phone: user.phoneHash,
    //   role: user.role,
    //   realNameStatus: user.realNameStatus,
    // };

    this.logger.debug(`[验证用户] ID: ${userId}`);

    return {
      userId,
      phone: 'mock-phone-hash',
      role: UserRole.USER,
      realNameVerified: false,
      nickname: 'mock-user',
    };
  }

  // ==================== 工具方法 ====================

  /**
   * 手机号脱敏（用于日志）
   */
  private maskPhone(phone: string): string {
    if (phone.length < 7) return '***';
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }
}