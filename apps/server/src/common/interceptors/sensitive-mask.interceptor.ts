import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * 敏感数据脱敏拦截器
 * 对响应中的敏感字段进行自动脱敏处理
 * - 手机号: 138****1234（中间四位脱敏）
 * - 身份证号: 320***********1234（中间十二位脱敏）
 * - 真实姓名: 张*（保留姓，名脱敏）
 * - 邮箱: t***@example.com
 */
@Injectable()
export class SensitiveMaskInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => this.maskSensitiveData(data)),
    );
  }

  /**
   * 递归脱敏数据对象
   */
  private maskSensitiveData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...(data as Record<string, unknown>) };
      for (const key of Object.keys(masked)) {
        const value = masked[key];
        if (typeof value === 'string') {
          masked[key] = this.maskField(key, value);
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = this.maskSensitiveData(value);
        }
      }
      return masked;
    }

    return data;
  }

  /**
   * 根据字段名称判断是否需要脱敏，并执行脱敏
   */
  private maskField(key: string, value: string): string {
    if (!value) return value;

    const lowerKey = key.toLowerCase();

    // 手机号脱敏
    if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('tel')) {
      return this.maskPhone(value);
    }

    // 身份证号脱敏
    if (lowerKey.includes('idcard') || lowerKey.includes('id_card') || lowerKey.includes('identity')) {
      return this.maskIdCard(value);
    }

    // 真实姓名脱敏
    if (lowerKey.includes('realname') || lowerKey.includes('real_name')) {
      return this.maskRealName(value);
    }

    // 邮箱脱敏
    if (lowerKey.includes('email')) {
      return this.maskEmail(value);
    }

    return value;
  }

  /** 手机号: 138****1234 */
  private maskPhone(phone: string): string {
    if (phone.length < 7) return phone;
    return phone.replace(/^(\d{3})\d{4}(\d+)$/, '$1****$2');
  }

  /** 身份证号: 320***********1234 */
  private maskIdCard(idCard: string): string {
    if (idCard.length < 8) return idCard;
    if (idCard.length === 18) {
      return idCard.replace(/^(\d{3})\d{12}(\d{3})$/, '$1***********$2');
    }
    return idCard.replace(/^(\d{3})\d+(\d{3})$/, '$1***********$2');
  }

  /** 真实姓名: 张* / 张三* */
  private maskRealName(name: string): string {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 1);
  }

  /** 邮箱: t***@example.com */
  private maskEmail(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex <= 1) return email;
    const localPart = email.substring(0, atIndex);
    const domain = email.substring(atIndex);
    return localPart[0] + '***' + domain;
  }
}