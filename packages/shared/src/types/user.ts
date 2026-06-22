/**
 * 用户相关类型定义
 * 包含用户资料、封禁请求及处罚类型等
 */

import type { UserRole } from './auth';

/** 处罚类型 */
export enum PenaltyType {
  /** 警告 */
  WARNING = 'WARNING',
  /** 禁言（限制发布点评和评论） */
  MUTE = 'MUTE',
  /** 临时封禁（限制登录） */
  TEMP_BAN = 'TEMP_BAN',
  /** 永久封禁 */
  PERMANENT_BAN = 'PERMANENT_BAN',
}

/** 用户资料 */
export interface UserProfile {
  /** 用户唯一标识 */
  id: string;
  /** 手机号码（脱敏显示） */
  phone: string;
  /** 真实姓名（脱敏显示） */
  realName: string;
  /** 身份证号码（脱敏显示） */
  idCardNumber: string;
  /** 用户角色 */
  role: UserRole;
  /** 头像地址 */
  avatar?: string;
  /** 昵称 */
  nickname?: string;
  /** 性别 */
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  /** 生日 */
  birthday?: string;
  /** 邮箱 */
  email?: string;
  /** 所属城市 */
  city?: string;
  /** 个人简介 */
  bio?: string;
  /** 发布的点评数 */
  reviewCount: number;
  /** 收到的点赞数 */
  totalLikes: number;
  /** 账号状态 */
  status: 'ACTIVE' | 'MUTED' | 'BANNED';
  /** 处罚类型（如有） */
  penaltyType?: PenaltyType;
  /** 处罚到期时间 */
  penaltyExpiresAt?: string;
  /** 注册时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 用户封禁请求 */
export interface UserBanRequest {
  /** 目标用户 ID */
  userId: string;
  /** 处罚类型 */
  penaltyType: PenaltyType;
  /** 处罚原因 */
  reason: string;
  /** 处罚时长（天数，临时封禁时必填） */
  duration?: number;
  /** 操作管理员 ID */
  operatorId: string;
}