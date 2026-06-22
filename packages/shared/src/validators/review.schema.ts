/**
 * 点评数据校验规则（Zod Schema）
 * 用于校验 CreateReviewDTO 的所有字段，确保数据合法性
 */

import { z } from 'zod';
import { EmploymentType } from '../constants';

/** 创建点评请求校验规则 */
export const createReviewSchema = z.object({
  /**
   * 职位名称
   * - 必填字段
   * - 最少 2 个字符，最多 100 个字符
   */
  jobTitle: z
    .string({ required_error: '职位名称不能为空' })
    .min(2, '职位名称至少 2 个字符')
    .max(100, '职位名称不能超过 100 个字符'),

  /**
   * 入职日期
   * - 必填字段
   * - 必须是合法的日期字符串（YYYY-MM-DD 格式）
   */
  startDate: z
    .string({ required_error: '入职日期不能为空' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, '入职日期格式不正确，应为 YYYY-MM-DD'),

  /**
   * 离职日期
   * - 可为 null 或空字符串（表示至今在职）
   * - 如有值，必须是合法的日期字符串
   */
  endDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '离职日期格式不正确，应为 YYYY-MM-DD'),
      z.literal(''),
      z.null(),
    ])
    .optional()
    .default(null),

  /**
   * 雇佣类型
   * - 必填字段
   * - 必须是 EmploymentType 枚举值之一
   */
  employmentType: z.nativeEnum(EmploymentType, {
    required_error: '雇佣类型不能为空',
    invalid_type_error: '无效的雇佣类型',
  }),

  /**
   * 点评内容
   * - 必填字段
   * - 最少 50 个字符，最多 5000 个字符
   */
  content: z
    .string({ required_error: '点评内容不能为空' })
    .min(50, '点评内容至少 50 个字符')
    .max(5000, '点评内容不能超过 5000 个字符'),

  /**
   * 评分维度
   * - 必填字段
   * - 每个维度评分范围为 1-5
   */
  rating: z.object(
    {
      overall: z
        .number({ required_error: '综合评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
      salary: z
        .number({ required_error: '薪资福利评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
      environment: z
        .number({ required_error: '工作环境评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
      growth: z
        .number({ required_error: '发展前景评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
      management: z
        .number({ required_error: '管理风格评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
      workLifeBalance: z
        .number({ required_error: '工作生活平衡评分不能为空' })
        .int('评分必须为整数')
        .min(1, '评分最低为 1 分')
        .max(5, '评分最高为 5 分'),
    },
    { required_error: '评分维度不能为空' },
  ),

  /**
   * 证明材料 ID 列表
   * - 必填字段
   * - 至少包含 1 个证明材料
   * - 每个 ID 必须为非空字符串
   */
  evidenceIds: z
    .array(
      z.string({ required_error: '证明材料 ID 不能为空' }).min(1, '证明材料 ID 不能为空'),
      { required_error: '证明材料不能为空' },
    )
    .min(1, '至少需要上传 1 个证明材料'),

  /**
   * 是否同意用户协议
   * - 必填字段
   * - 必须为 true（用户必须同意协议）
   */
  agreementAccepted: z
    .boolean({ required_error: '请确认是否同意用户协议' })
    .refine((val) => val === true, {
      message: '必须同意用户协议才能提交点评',
    }),
});

/** 创建点评请求的类型推断 */
export type CreateReviewInput = z.infer<typeof createReviewSchema>;