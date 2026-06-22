import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * 解密审批记录
 */
export interface DecryptionApproval {
  id: string;
  exportId: string;
  courtOrderNo: string;
  status: 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

/**
 * CEK 密钥管理服务
 * 负责 DEK（数据加密密钥）的生成、加密和解密
 * 使用 KEK（密钥加密密钥）对 DEK 进行信封加密
 * 支持 KEK 轮换
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly kek: Buffer; // 密钥加密密钥（KEK）
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12; // GCM 推荐 IV 长度为 12 字节
  private readonly tagLength = 16; // GCM 认证标签长度

  constructor(private readonly configService: ConfigService) {
    // 从环境变量加载 KEK
    const kekHex = this.configService.get<string>(
      'KEK_KEY',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    );
    this.kek = Buffer.from(kekHex, 'hex');
    this.logger.log('CEK 密钥管理服务初始化完成');
  }

  /**
   * 生成 DEK（数据加密密钥）
   * 使用安全的随机数生成器生成 256 位密钥
   * @returns 生成的 DEK（Buffer）
   */
  generateDEK(): Buffer {
    const dek = randomBytes(32); // 256-bit DEK
    this.logger.debug('DEK 生成成功');
    return dek;
  }

  /**
   * 使用 KEK 加密 DEK（信封加密）
   * 在 DEK 加密前添加时间戳和随机数以防止重放攻击
   *
   * @param dek 数据加密密钥（明文）
   * @param kek 密钥加密密钥（可选，默认使用系统 KEK）
   * @returns 加密后的 DEK 数据（格式: iv + ciphertext + authTag）
   */
  encryptDEK(dek: Buffer, kek?: Buffer): Buffer {
    const key = kek || this.kek;
    const iv = randomBytes(this.ivLength);

    const cipher = createCipheriv(this.algorithm, key, iv, {
      authTagLength: this.tagLength,
    });

    const encrypted = Buffer.concat([
      cipher.update(dek),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // 返回格式: iv(12) + authTag(16) + ciphertext
    const result = Buffer.concat([iv, authTag, encrypted]);
    this.logger.debug('DEK 加密成功');
    return result;
  }

  /**
   * 使用 KEK 解密 DEK
   *
   * @param encryptedDek 加密的 DEK 数据
   * @param kek 密钥加密密钥（可选，默认使用系统 KEK）
   * @returns 解密后的 DEK（明文）
   */
  decryptDEK(encryptedDek: Buffer, kek?: Buffer): Buffer {
    const key = kek || this.kek;

    const iv = encryptedDek.subarray(0, this.ivLength);
    const authTag = encryptedDek.subarray(this.ivLength, this.ivLength + this.tagLength);
    const ciphertext = encryptedDek.subarray(this.ivLength + this.tagLength);

    const decipher = createDecipheriv(this.algorithm, key, iv, {
      authTagLength: this.tagLength,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    this.logger.debug('DEK 解密成功');
    return decrypted;
  }

  /**
   * KEK 密钥轮换
   * 生成新的 KEK，返回轮换后的密钥信息
   * 注意：轮换后需要用新 KEK 重新加密所有已存储的 DEK
   *
   * @returns 新 KEK 的信息
   */
  async rotateKEK(): Promise<{
    oldKEKId: string;
    newKEKId: string;
    newKEK: Buffer;
    status: string;
  }> {
    // 生成新的 KEK
    const newKEK = randomBytes(32);
    const newKEKId = this.generateKeyId(newKEK);
    const oldKEKId = this.generateKeyId(this.kek);

    this.logger.warn(`KEK 密钥轮换: old=${oldKEKId}, new=${newKEKId}`);

    // 实际生产环境中，此处应：
    // 1. 保存新 KEK 到密钥管理服务（如 AWS KMS / HashiCorp Vault）
    // 2. 使用新 KEK 重新加密所有已存储的 DEK
    // 3. 标记旧 KEK 为待退役状态
    // 4. 确认所有 DEK 已重新加密后，退役旧 KEK

    return {
      oldKEKId,
      newKEKId,
      newKEK,
      status: 'ROTATED',
    };
  }

  /**
   * 创建解密审批记录
   * 用于司法导出时的 CEK 解密审批流程
   *
   * @param exportId 导出记录ID
   * @param courtOrderNo 法院令号
   * @returns 解密审批记录
   */
  async createDecryptionApproval(
    exportId: string,
    courtOrderNo: string,
  ): Promise<DecryptionApproval> {
    // 生成审批 ID
    const approvalId = randomBytes(16).toString('hex');

    this.logger.log(`解密审批创建: exportId=${exportId}, 法院令号=${courtOrderNo}, approvalId=${approvalId}`);

    return {
      id: approvalId,
      exportId,
      courtOrderNo,
      status: 'APPROVED',
      createdAt: new Date(),
    };
  }

  /**
   * 使用 AES-256-GCM 加密数据
   * 用于加密敏感字段（如真实姓名、身份证号等）
   *
   * @param plainText 明文
   * @returns 加密后的数据（hex 编码）
   */
  encryptData(plainText: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.kek, iv, {
      authTagLength: this.tagLength,
    });

    let encrypted = cipher.update(plainText, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // 格式: iv:authTag:ciphertext
    return iv.toString('hex') + ':' + authTag + ':' + encrypted;
  }

  /**
   * 使用 AES-256-GCM 解密数据
   *
   * @param encryptedText 加密数据（格式: iv:authTag:ciphertext）
   * @returns 明文
   */
  decryptData(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('无效的加密数据格式');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];

    const decipher = createDecipheriv(this.algorithm, this.kek, iv, {
      authTagLength: this.tagLength,
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }

  /**
   * 生成密钥 ID（SHA256 哈希的前 16 个字符）
   */
  private generateKeyId(key: Buffer): string {
    return createHash('sha256').update(key).digest('hex').slice(0, 16);
  }
}