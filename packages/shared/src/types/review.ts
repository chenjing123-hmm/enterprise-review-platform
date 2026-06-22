/**
 * 点评相关类型定义
 * 包含点评的创建 DTO、响应结构、审核与发布状态、雇佣类型及评分维度等
 */

/** 审核状态 */
export enum AuditStatus {
  /** 待审核 */
  PENDING = 'PENDING',
  /** 审核通过 */
  APPROVED = 'APPROVED',
  /** 审核驳回 */
  REJECTED = 'REJECTED',
}

/** 发布状态 */
export enum PublishStatus {
  /** 草稿 */
  DRAFT = 'DRAFT',
  /** 已发布 */
  PUBLISHED = 'PUBLISHED',
  /** 已隐藏 */
  HIDDEN = 'HIDDEN',
  /** 已删除 */
  DELETED = 'DELETED',
}

/** 雇佣类型 */
export enum EmploymentType {
  /** 全职 */
  FULL_TIME = 'FULL_TIME',
  /** 兼职 */
  PART_TIME = 'PART_TIME',
  /** 实习 */
  INTERNSHIP = 'INTERNSHIP',
  /** 劳务派遣 */
  CONTRACT = 'CONTRACT',
  /** 外包 */
  OUTSOURCING = 'OUTSOURCING',
  /** 试用期 */
  PROBATION = 'PROBATION',
}

/** 评分维度 */
export interface RatingDimensions {
  /** 综合评分 (1-5) */
  overall: number;
  /** 薪资福利 (1-5) */
  salary: number;
  /** 工作环境 (1-5) */
  environment: number;
  /** 发展前景 (1-5) */
  growth: number;
  /** 管理风格 (1-5) */
  management: number;
  /** 工作生活平衡 (1-5) */
  workLifeBalance: number;
}

/** 创建点评请求 DTO */
export interface CreateReviewDTO {
  /** 职位名称 */
  jobTitle: string;
  /** 入职日期（ISO 8601 格式） */
  startDate: string;
  /** 离职日期（ISO 8601 格式，至今则传空字符串） */
  endDate: string | null;
  /** 雇佣类型 */
  employmentType: EmploymentType;
  /** 点评内容（最少 50 个字符） */
  content: string;
  /** 评分维度 */
  rating: RatingDimensions;
  /** 证明材料 ID 列表（至少 1 个） */
  evidenceIds: string[];
  /** 是否同意用户协议 */
  agreementAccepted: boolean;
}

/** 点评响应 */
export interface ReviewResponse {
  /** 点评唯一标识 */
  id: string;
  /** 所属企业 ID */
  companyId: string;
  /** 所属企业名称 */
  companyName: string;
  /** 发布用户 ID */
  userId: string;
  /** 发布用户昵称（脱敏后） */
  userNickname: string;
  /** 职位名称 */
  jobTitle: string;
  /** 入职日期 */
  startDate: string;
  /** 离职日期 */
  endDate: string | null;
  /** 雇佣类型 */
  employmentType: EmploymentType;
  /** 点评内容 */
  content: string;
  /** 评分维度 */
  rating: RatingDimensions;
  /** 证明材料 ID 列表 */
  evidenceIds: string[];
  /** 审核状态 */
  auditStatus: AuditStatus;
  /** 发布状态 */
  publishStatus: PublishStatus;
  /** 审核备注 */
  auditRemark?: string;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 是否匿名 */
  isAnonymous: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}