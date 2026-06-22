/**
 * 用户数据校验规则（Zod Schema）
 * 用于校验 RegisterDTO 的所有字段，确保数据合法性
 */

import { z } from 'zod';

/** 用户注册请求校验规则 */
export const registerSchema = z.object({
  /**
   * 手机号码
   * - 必填字段
   * - 必须是合法的大陆手机号（11 位，1 开头）
   */
  phone: z
    .string({ required_error: '手机号码不能为空' })
    .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码'),

  /**
   * 短信验证码
   * - 必填字段
   * - 必须是 4-6 位数字
   */
  code: z
    .string({ required_error: '验证码不能为空' })
    .regex(/^\d{4,6}$/, '验证码格式不正确，应为 4-6 位数字'),

  /**
   * 真实姓名
   * - 必填字段
   * - 中文姓名 2-20 个字符（支持少数民族姓名中的间隔号）
   */
  realName: z
    .string({ required_error: '真实姓名不能为空' })
    .min(2, '真实姓名至少 2 个字符')
    .max(20, '真实姓名不能超过 20 个字符')
    .regex(
      /^[\u4e00-\u9fa5·]{2,20}$/,
      '真实姓名只能包含中文字符',
    ),

  /**
   * 身份证号码
   * - 必填字段
   * - 18 位身份证号码格式校验
   */
  idCardNumber: z
    .string({ required_error: '身份证号码不能为空' })
    .regex(
      /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
      '请输入正确的身份证号码',
    ),
});

/** 用户登录请求校验规则 */
export const loginSchema = z.object({
  /**
   * 手机号码
   * - 必填字段
   * - 必须是合法的大陆手机号（11 位，1 开头）
   */
  phone: z
    .string({ required_error: '手机号码不能为空' })
    .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码'),

  /**
   * 短信验证码（验证码登录方式）
   */
  code: z
    .string()
    .regex(/^\d{4,6}$/, '验证码格式不正确，应为 4-6 位数字')
    .optional(),

  /**
   * 登录密码（密码登录方式）
   * - 至少 6 个字符
   */
  password: z
    .string()
    .min(6, '密码至少 6 个字符')
    .max(32, '密码不能超过 32 个字符')
    .optional(),
}).refine(
  (data) => data.code || data.password,
  {
    message: '验证码或密码至少填写一项',
    path: ['code'],
  },
);

/** 注册请求的类型推断 */
export type RegisterInput = z.infer<typeof registerSchema>;

/** 登录请求的类型推断 */
export type LoginInput = z.infer<typeof loginSchema>;