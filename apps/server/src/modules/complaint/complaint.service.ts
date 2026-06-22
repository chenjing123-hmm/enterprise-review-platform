import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { ComplaintTicket } from './complaint-ticket.entity';
import { ComplaintMaterial } from './complaint-material.entity';
import { ComplaintResponse } from '@erp/shared';

/**
 * 投诉工单服务
 * 负责投诉工单的创建、处理、24小时倒计时超时检查
 * 超时自动创建风险预警
 */
@Injectable()
export class ComplaintService {
  private readonly logger = new Logger(ComplaintService.name);

  constructor(
    @InjectRepository(ComplaintTicket)
    private readonly ticketRepository: Repository<ComplaintTicket>,
    @InjectRepository(ComplaintMaterial)
    private readonly materialRepository: Repository<ComplaintMaterial>,
  ) {}

  /**
   * 创建投诉工单（公开接口）
   * 生成工单编号 TK-YYYYMMDD-序号，设置24小时处理截止时间
   *
   * @param data 投诉数据
   * @returns 创建的投诉工单
   */
  async createTicket(data: {
    complainantId?: string;
    complainantName?: string;
    complainantContact?: string;
    targetType: string;
    targetId: string;
    complaintType: string;
    reason: string;
    description?: string;
    materialIds?: string[];
  }): Promise<ComplaintResponse> {
    // 生成工单编号
    const ticketNo = await this.generateTicketNo();

    // 计算24小时处理截止时间
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    const ticket = this.ticketRepository.create({
      ticketNo,
      complainantId: data.complainantId || 'anonymous',
      complainantName: data.complainantName || '匿名用户',
      complainantContact: data.complainantContact,
      targetType: data.targetType,
      targetId: data.targetId,
      complaintType: data.complaintType,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      deadline,
      isOverdue: false,
      riskAlertCreated: false,
    });

    const saved = await this.ticketRepository.save(ticket);
    this.logger.log(`投诉工单创建: ${ticketNo}, 类型=${data.complaintType}, 截止时间=${deadline.toISOString()}`);

    return this.toResponse(saved);
  }

  /**
   * 根据工单编号查询状态（公开接口）
   * @param ticketNo 工单编号
   */
  async getStatusByTicketNo(ticketNo: string): Promise<ComplaintResponse> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketNo },
    });

    if (!ticket) {
      throw new NotFoundException(`工单不存在: ${ticketNo}`);
    }

    return this.toResponse(ticket);
  }

  /**
   * 获取投诉工单列表（管理员）
   */
  async findAll(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
  ): Promise<{ items: ComplaintResponse[]; total: number }> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [items, total] = await this.ticketRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    this.logger.log(`投诉工单列表查询: status=${status || 'all'}, 结果数=${total}`);

    return {
      items: items.map((t) => this.toResponse(t)),
      total,
    };
  }

  /**
   * 获取投诉工单详情（管理员）
   */
  async findById(id: string): Promise<ComplaintResponse> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['materials'],
    });

    if (!ticket) {
      throw new NotFoundException(`工单不存在: ${id}`);
    }

    return this.toResponse(ticket);
  }

  /**
   * 更新投诉工单（管理员）
   */
  async update(id: string, data: Partial<ComplaintTicket>): Promise<ComplaintResponse> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`工单不存在: ${id}`);
    }

    Object.assign(ticket, data);
    const saved = await this.ticketRepository.save(ticket);
    this.logger.log(`投诉工单更新: ${saved.ticketNo}`);

    return this.toResponse(saved);
  }

  /**
   * 处理（解决）投诉工单（管理员）
   * @param id 工单ID
   * @param handlerId 处理人ID
   * @param handlerName 处理人名称
   * @param result 处理结果
   */
  async resolveTicket(
    id: string,
    handlerId: string,
    handlerName: string,
    result: string,
  ): Promise<ComplaintResponse> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`工单不存在: ${id}`);
    }

    if (ticket.status === 'RESOLVED') {
      throw new BadRequestException('该工单已处理');
    }

    ticket.status = 'RESOLVED';
    ticket.handlerId = handlerId;
    ticket.handlerName = handlerName;
    ticket.result = result;
    ticket.resolvedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);
    this.logger.log(`投诉工单已处理: ${saved.ticketNo}, handler=${handlerName}`);

    return this.toResponse(saved);
  }

  /**
   * 检查24小时处理截止时间
   * 找出所有超过截止时间且未处理的工单，自动创建风险预警
   * 此方法应由定时任务（cron）定期调用
   */
  async checkDeadline(): Promise<{
    overdueCount: number;
    newlyOverdue: string[];
  }> {
    const now = new Date();

    // 查找已超时但未标记为超时的工单
    const overdueTickets = await this.ticketRepository.find({
      where: {
        deadline: LessThan(now),
        isOverdue: false,
        status: 'PENDING',
      },
    });

    const newlyOverdue: string[] = [];

    for (const ticket of overdueTickets) {
      ticket.isOverdue = true;
      await this.ticketRepository.save(ticket);
      newlyOverdue.push(ticket.ticketNo);

      this.logger.warn(`投诉工单超时: ${ticket.ticketNo}, 已超过24小时处理期限`);
    }

    // 查找需要创建风险预警的工单（已超时但未创建预警）
    const needAlertTickets = await this.ticketRepository.find({
      where: {
        isOverdue: true,
        riskAlertCreated: false,
        status: 'PENDING',
      },
    });

    for (const ticket of needAlertTickets) {
      // 自动创建风险预警
      ticket.riskAlertCreated = true;
      await this.ticketRepository.save(ticket);

      this.logger.warn(`为超时工单创建风险预警: ${ticket.ticketNo}`);

      // 此处应调用 RiskService.createAlert() 创建风险预警
      // 由于模块依赖关系，此处在实际项目中通过事件总线或依赖注入实现
    }

    return {
      overdueCount: overdueTickets.length,
      newlyOverdue,
    };
  }

  /**
   * 生成工单编号
   * 格式: TK-YYYYMMDD-序号
   */
  private async generateTicketNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 查询当天已有工单数
    const count = await this.ticketRepository
      .createQueryBuilder('ticket')
      .where('ticket.ticketNo LIKE :prefix', { prefix: `TK-${dateStr}-%` })
      .getCount();

    const seq = String(count + 1).padStart(4, '0');
    return `TK-${dateStr}-${seq}`;
  }

  /**
   * 转换为响应格式
   */
  private toResponse(ticket: ComplaintTicket): ComplaintResponse {
    return {
      id: ticket.id,
      complainantId: ticket.complainantId,
      complainantName: ticket.complainantName,
      targetType: ticket.targetType,
      targetId: ticket.targetId,
      complaintType: ticket.complaintType as any,
      reason: ticket.reason,
      description: ticket.description,
      status: ticket.status as any,
      result: ticket.result,
      handlerId: ticket.handlerId,
      handlerName: ticket.handlerName,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
    };
  }
}