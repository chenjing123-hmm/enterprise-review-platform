/**
 * 审核相关类型定义
 * 包含审核队列项、审核操作及审核记录等
 */

import type { AuditStatus } from './review';

/** 审核队列项 */
export interface AuditQueueItem {
  /** 审核队列唯一标识 */
  id: string;
  /** 审核目标类型（如 review、company） */
  targetType: string;
  /** 审核目标 ID */
  targetId: string;
  /** 审核目标摘要信息 */
  targetSummary: {
    /** 标题/名称 */
    title: string;
    /** 提交用户 ID */
    submitterId: string;
    /** 提交用户昵称 */
    submitterName: string;
    /** 提交时间 */
    submittedAt: string;
  };
  /** 审核状态 */
  status: AuditStatus;
  /** 优先级（数字越大越优先） */
  priority: number;
  /** 进入队列时间 */
  queuedAt: string;
}

/** 审核操作 */
export interface AuditAction {
  /** 审核队列项 ID */
  queueItemId: string;
  /** 审核结果 */
  action: 'APPROVE' | 'REJECT';
  /** 审核备注 */
  remark?: string;
  /** 驳回原因 */
  rejectReason?: string;
  /** 审核人 ID */
  auditorId: string;
}

/** 审核记录 */
export interface AuditRecord {
  /** 审核记录唯一标识 */
  id: string;
  /** 审核目标类型 */
  targetType: string;
  /** 审核目标 ID */
  targetId: string;
  /** 审核结果 */
  action: 'APPROVE' | 'REJECT';
  /** 审核备注 */
  remark?: string;
  /** 驳回原因 */
  rejectReason?: string;
  /** 审核前状态 */
  previousStatus: AuditStatus;
  /** 审核后状态 */
  newStatus: AuditStatus;
  /** 审核人 ID */
  auditorId: string;
  /** 审核人名称 */
  auditorName: string;
  /** 审核时间 */
  createdAt: string;
}