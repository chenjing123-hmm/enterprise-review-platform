/**
 * 全局常量与枚举定义
 * 集中管理平台中所有公共枚举值，确保前后端一致
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

/** 敏感词分类 */
export enum SensitiveWordCategory {
  /** 政治敏感 */
  POLITICAL = 'POLITICAL',
  /** 色情低俗 */
  PORNOGRAPHIC = 'PORNOGRAPHIC',
  /** 暴力恐怖 */
  VIOLENCE = 'VIOLENCE',
  /** 广告骚扰 */
  ADVERTISEMENT = 'ADVERTISEMENT',
  /** 违法信息 */
  ILLEGAL = 'ILLEGAL',
  /** 辱骂歧视 */
  HATE_SPEECH = 'HATE_SPEECH',
  /** 其他违规 */
  OTHER = 'OTHER',
}

/** 敏感词严重程度 */
export enum SensitiveWordSeverity {
  /** 轻微 */
  LOW = 'LOW',
  /** 中等 */
  MEDIUM = 'MEDIUM',
  /** 严重 */
  HIGH = 'HIGH',
  /** 极严重 */
  CRITICAL = 'CRITICAL',
}

/** 投诉类型 */
export enum ComplaintType {
  /** 虚假信息 */
  FALSE_INFO = 'FALSE_INFO',
  /** 恶意诋毁 */
  MALICIOUS_DEFAMATION = 'MALICIOUS_DEFAMATION',
  /** 人身攻击 */
  PERSONAL_ATTACK = 'PERSONAL_ATTACK',
  /** 泄露隐私 */
  PRIVACY_LEAK = 'PRIVACY_LEAK',
  /** 广告骚扰 */
  SPAM = 'SPAM',
  /** 侵权内容 */
  COPYRIGHT_INFRINGEMENT = 'COPYRIGHT_INFRINGEMENT',
  /** 其他 */
  OTHER = 'OTHER',
}

/** 管理员角色 */
export enum AdminRole {
  /** 超级管理员 */
  SUPER_ADMIN = 'SUPER_ADMIN',
  /** 内容审核员 */
  CONTENT_AUDITOR = 'CONTENT_AUDITOR',
  /** 用户管理员 */
  USER_MANAGER = 'USER_MANAGER',
  /** 数据管理员 */
  DATA_MANAGER = 'DATA_MANAGER',
}

/** 用户角色 */
export enum UserRole {
  /** 普通用户 */
  USER = 'USER',
  /** 平台管理员 */
  ADMIN = 'ADMIN',
  /** 超级管理员 */
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/** 处罚类型 */
export enum PenaltyType {
  /** 警告 */
  WARNING = 'WARNING',
  /** 禁言 */
  MUTE = 'MUTE',
  /** 临时封禁 */
  TEMP_BAN = 'TEMP_BAN',
  /** 永久封禁 */
  PERMANENT_BAN = 'PERMANENT_BAN',
}

/** 投诉状态 */
export enum ComplaintStatus {
  /** 待处理 */
  PENDING = 'PENDING',
  /** 处理中 */
  PROCESSING = 'PROCESSING',
  /** 已处理 */
  RESOLVED = 'RESOLVED',
  /** 已驳回 */
  DISMISSED = 'DISMISSED',
}

/** 雇佣类型的中文标签映射 */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: '全职',
  [EmploymentType.PART_TIME]: '兼职',
  [EmploymentType.INTERNSHIP]: '实习',
  [EmploymentType.CONTRACT]: '劳务派遣',
  [EmploymentType.OUTSOURCING]: '外包',
  [EmploymentType.PROBATION]: '试用期',
};

/** 审核状态的中文标签映射 */
export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  [AuditStatus.PENDING]: '待审核',
  [AuditStatus.APPROVED]: '审核通过',
  [AuditStatus.REJECTED]: '审核驳回',
};

/** 发布状态的中文标签映射 */
export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  [PublishStatus.DRAFT]: '草稿',
  [PublishStatus.PUBLISHED]: '已发布',
  [PublishStatus.HIDDEN]: '已隐藏',
  [PublishStatus.DELETED]: '已删除',
};

/** 评分维度标签映射 */
export const RATING_DIMENSION_LABELS: Record<string, string> = {
  overall: '综合评分',
  salary: '薪资福利',
  environment: '工作环境',
  growth: '发展前景',
  management: '管理风格',
  workLifeBalance: '工作生活平衡',
};

/** 敏感词严重程度的中文标签映射 */
export const SENSITIVE_WORD_SEVERITY_LABELS: Record<SensitiveWordSeverity, string> = {
  [SensitiveWordSeverity.LOW]: '轻微',
  [SensitiveWordSeverity.MEDIUM]: '中等',
  [SensitiveWordSeverity.HIGH]: '严重',
  [SensitiveWordSeverity.CRITICAL]: '极严重',
};

/** 处罚类型的中文标签映射 */
export const PENALTY_TYPE_LABELS: Record<PenaltyType, string> = {
  [PenaltyType.WARNING]: '警告',
  [PenaltyType.MUTE]: '禁言',
  [PenaltyType.TEMP_BAN]: '临时封禁',
  [PenaltyType.PERMANENT_BAN]: '永久封禁',
};

/** 公开路由元数据键 */
export const PUBLIC_ROUTE_KEY = 'isPublic';

/** 角色权限元数据键 */
export const ROLES_KEY = 'roles';