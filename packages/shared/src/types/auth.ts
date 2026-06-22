/**
 * 认证相关类型定义
 * 包含用户角色、注册登录 DTO、认证响应及令牌载荷等核心类型
 */

/** 用户角色枚举 */
export enum UserRole {
  /** 普通用户 */
  USER = 'USER',
  /** 平台管理员 */
  ADMIN = 'ADMIN',
  /** 超级管理员 */
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/** 用户注册请求 DTO */
export interface RegisterDTO {
  /** 手机号码 */
  phone: string;
  /** 短信验证码 */
  code: string;
  /** 真实姓名 */
  realName: string;
  /** 身份证号码 */
  idCardNumber: string;
  /** 登录密码 */
  password: string;
}

/** 用户登录请求 DTO */
export interface LoginDTO {
  /** 手机号码 */
  phone: string;
  /** 短信验证码（验证码登录） */
  code?: string;
  /** 登录密码（密码登录） */
  password?: string;
}

/** 认证响应 */
export interface AuthResponse {
  /** JWT 访问令牌 */
  accessToken: string;
  /** JWT 刷新令牌 */
  refreshToken: string;
  /** 令牌过期时间（Unix 时间戳，单位：秒） */
  expiresIn: number;
  /** 用户基本信息 */
  user: {
    /** 用户唯一标识 */
    id: string;
    /** 手机号码 */
    phone: string;
    /** 真实姓名 */
    realName: string;
    /** 用户角色 */
    role: UserRole;
    /** 头像地址 */
    avatar?: string;
  };
}

/** JWT 令牌载荷 */
export interface TokenPayload {
  /** 用户唯一标识 */
  userId: string;
  /** 用户角色 */
  role: UserRole;
  /** 令牌签发时间（Unix 时间戳） */
  iat: number;
  /** 令牌过期时间（Unix 时间戳） */
  exp: number;
}

/** 实名认证状态 */
export enum RealNameStatus {
  /** 未认证 */
  UNVERIFIED = 'UNVERIFIED',
  /** 审核中 */
  PENDING = 'PENDING',
  /** 已认证 */
  VERIFIED = 'VERIFIED',
  /** 已驳回 */
  REJECTED = 'REJECTED',
}

/** 用户状态 */
export enum UserStatus {
  /** 正常 */
  ACTIVE = 'ACTIVE',
  /** 封禁 */
  BANNED = 'BANNED',
  /** 已删除 */
  DELETED = 'DELETED',
}

/** 请求上下文中的用户信息 */
export interface RequestUser {
  /** 用户唯一标识 */
  userId: string;
  /** 手机号码 */
  phone: string;
  /** 用户角色 */
  role: string;
  /** 是否已实名认证 */
  realNameVerified: boolean;
  /** 昵称 */
  nickname: string;
}

/** JWT 令牌载荷（用于 token 验证） */
export interface JwtPayload {
  /** 用户唯一标识 */
  sub: string;
  /** 手机号码 */
  phone: string;
  /** 用户角色 */
  role: string;
  /** 签发时间 */
  iat?: number;
  /** 过期时间 */
  exp?: number;
}

/** JWT 令牌响应 */
export interface JwtTokenResponse {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 过期时间（秒） */
  expiresIn: number;
}

/** 通用 API 响应 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 数据 */
  data?: T;
}