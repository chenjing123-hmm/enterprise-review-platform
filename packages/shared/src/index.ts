/**
 * 企业点评平台 - 共享包统一导出入口
 *
 * 本模块集中导出所有公共类型、常量和校验规则，
 * 供前端和后端统一引用，确保全栈类型一致。
 */

// ============================================================
// 类型定义（Types）
// ============================================================

// 认证相关类型
export {
  UserRole,
  type RegisterDTO,
  type LoginDTO,
  type AuthResponse,
  type TokenPayload,
  RealNameStatus,
  UserStatus,
  type RequestUser,
  type JwtPayload,
  type JwtTokenResponse,
  type ApiResponse,
} from './types/auth';

// 点评相关类型
export {
  AuditStatus,
  PublishStatus,
  EmploymentType,
  type RatingDimensions,
  type CreateReviewDTO,
  type ReviewResponse,
} from './types/review';

// 企业相关类型
export {
  type CompanyResponse,
  type CompanySearchResult,
  type CompanySearchParams,
} from './types/company';

// 投诉相关类型
export {
  ComplaintStatus,
  ComplaintType,
  type CreateComplaintDTO,
  type ComplaintResponse,
} from './types/complaint';

// 审核相关类型
export {
  type AuditQueueItem,
  type AuditAction,
  type AuditRecord,
} from './types/audit';

// 用户相关类型
export {
  PenaltyType,
  type UserProfile,
  type UserBanRequest,
} from './types/user';

// ============================================================
// 常量（Constants）
// ============================================================

export {
  AuditStatus as AuditStatusEnum,
  PublishStatus as PublishStatusEnum,
  EmploymentType as EmploymentTypeEnum,
  SensitiveWordCategory,
  SensitiveWordSeverity,
  ComplaintType as ComplaintTypeEnum,
  AdminRole,
  UserRole as UserRoleEnum,
  PenaltyType as PenaltyTypeEnum,
  ComplaintStatus as ComplaintStatusEnum,
  EMPLOYMENT_TYPE_LABELS,
  AUDIT_STATUS_LABELS,
  PUBLISH_STATUS_LABELS,
  RATING_DIMENSION_LABELS,
  SENSITIVE_WORD_SEVERITY_LABELS,
  PENALTY_TYPE_LABELS,
  PUBLIC_ROUTE_KEY,
  ROLES_KEY,
} from './constants';

// ============================================================
// 校验规则（Validators）
// ============================================================

export {
  createReviewSchema,
  type CreateReviewInput,
} from './validators/review.schema';

export {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from './validators/user.schema';

export {
  createComplaintSchema,
  type CreateComplaintInput,
} from './validators/complaint.schema';