/**
 * 投诉相关类型定义
 * 包含投诉创建 DTO、投诉响应、投诉状态及投诉类型等
 */

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

/** 创建投诉请求 DTO */
export interface CreateComplaintDTO {
  /** 投诉目标类型（如 review、comment 等） */
  targetType: string;
  /** 投诉目标 ID */
  targetId: string;
  /** 投诉类型 */
  complaintType: ComplaintType;
  /** 投诉原因描述 */
  reason: string;
  /** 投诉补充说明 */
  description?: string;
  /** 证明材料图片 URL 列表 */
  evidenceImages?: string[];
}

/** 投诉响应 */
export interface ComplaintResponse {
  /** 投诉唯一标识 */
  id: string;
  /** 投诉人用户 ID */
  complainantId: string;
  /** 投诉人昵称 */
  complainantName: string;
  /** 投诉目标类型 */
  targetType: string;
  /** 投诉目标 ID */
  targetId: string;
  /** 投诉类型 */
  complaintType: ComplaintType;
  /** 投诉原因描述 */
  reason: string;
  /** 投诉补充说明 */
  description?: string;
  /** 证明材料图片 URL 列表 */
  evidenceImages?: string[];
  /** 投诉状态 */
  status: ComplaintStatus;
  /** 处理结果说明 */
  result?: string;
  /** 处理人 ID */
  handlerId?: string;
  /** 处理人名称 */
  handlerName?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 处理时间 */
  resolvedAt?: string;
}