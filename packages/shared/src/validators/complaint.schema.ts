/**
 * 投诉数据校验规则（Zod Schema）
 * 用于校验 CreateComplaintDTO 的所有字段，确保数据合法性
 */

import { z } from 'zod';
import { ComplaintType } from '../constants';

/** 创建投诉请求校验规则 */
export const createComplaintSchema = z.object({
  /**
   * 投诉目标类型
   * - 必填字段
   * - 支持的取值：review、comment、company
   */
  targetType: z
    .string({ required_error: '投诉目标类型不能为空' })
    .refine((val) => ['review', 'comment', 'company'].includes(val), {
      message: '投诉目标类型无效，支持的类型：review、comment、company',
    }),

  /**
   * 投诉目标 ID
   * - 必填字段
   * - 必须为非空字符串
   */
  targetId: z
    .string({ required_error: '投诉目标 ID 不能为空' })
    .min(1, '投诉目标 ID 不能为空'),

  /**
   * 投诉类型
   * - 必填字段
   * - 必须是 ComplaintType 枚举值之一
   */
  complaintType: z.nativeEnum(ComplaintType, {
    required_error: '投诉类型不能为空',
    invalid_type_error: '无效的投诉类型',
  }),

  /**
   * 投诉原因描述
   * - 必填字段
   * - 最少 10 个字符，最多 500 个字符
   */
  reason: z
    .string({ required_error: '投诉原因不能为空' })
    .min(10, '投诉原因至少 10 个字符')
    .max(500, '投诉原因不能超过 500 个字符'),

  /**
   * 投诉补充说明
   * - 可选字段
   * - 最多 2000 个字符
   */
  description: z
    .string()
    .max(2000, '补充说明不能超过 2000 个字符')
    .optional(),

  /**
   * 证明材料图片 URL 列表
   * - 可选字段
   * - 最多 5 张图片
   * - 每个 URL 必须是合法的 URL 格式
   */
  evidenceImages: z
    .array(
      z.string().url('证明材料图片地址格式不正确'),
    )
    .max(5, '证明材料图片最多 5 张')
    .optional(),
});

/** 创建投诉请求的类型推断 */
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;