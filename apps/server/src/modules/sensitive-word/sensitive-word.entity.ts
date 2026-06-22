import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 敏感词实体（sensitive_word）
 * 存储敏感词库，支持分类、严重程度和启用状态
 * 用于 DFA（Deterministic Finite Automaton）Trie 树敏感词过滤
 */
@Entity('sensitive_words')
@Index(['word'])
@Index(['category'])
export class SensitiveWord {
  /** 敏感词唯一标识（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 敏感词文本 */
  @Column({ type: 'varchar', length: 100, comment: '敏感词文本' })
  word: string;

  /** 敏感词分类 */
  @Column({
    type: 'enum',
    enum: ['POLITICAL', 'PORNOGRAPHIC', 'VIOLENCE', 'ADVERTISEMENT', 'ILLEGAL', 'HATE_SPEECH', 'OTHER'],
    comment: '敏感词分类',
  })
  category: string;

  /** 严重程度 */
  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    comment: '严重程度',
  })
  severity: string;

  /** 是否启用 */
  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isEnabled: boolean;

  /** 替换词（可选，用于自动替换） */
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '替换词' })
  replacement: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}