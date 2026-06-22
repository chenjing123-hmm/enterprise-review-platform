import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensitiveWord } from './sensitive-word.entity';

/**
 * DFA Trie 树节点
 * 用于高效敏感词匹配（O(n)时间复杂度，n为文本长度）
 */
interface TrieNode {
  /** 子节点映射（字符 -> 子节点） */
  children: Map<string, TrieNode>;
  /** 是否为敏感词结尾 */
  isEnd: boolean;
  /** 敏感词信息（仅在 isEnd 为 true 时有效） */
  wordInfo?: {
    word: string;
    category: string;
    severity: string;
  };
}

/**
 * 敏感词过滤服务
 * 基于 DFA（Deterministic Finite Automaton）Trie 树实现
 * 从数据库加载敏感词库，构建 Trie 树，支持高效文本匹配
 */
@Injectable()
export class SensitiveWordService implements OnModuleInit {
  private readonly logger = new Logger(SensitiveWordService.name);

  /** DFA Trie 树根节点 */
  private trieRoot: TrieNode = { children: new Map(), isEnd: false };

  constructor(
    @InjectRepository(SensitiveWord)
    private readonly sensitiveWordRepository: Repository<SensitiveWord>,
  ) {}

  /**
   * 模块初始化时从数据库加载敏感词库并构建 Trie 树
   */
  async onModuleInit(): Promise<void> {
    await this.buildTrie();
    this.logger.log('敏感词 Trie 树初始化完成');
  }

  /**
   * 从数据库加载所有启用的敏感词，构建 DFA Trie 树
   */
  async buildTrie(): Promise<void> {
    const words = await this.sensitiveWordRepository.find({
      where: { isEnabled: true },
    });

    // 构建新的 Trie 树根节点
    const root: TrieNode = { children: new Map(), isEnd: false };

    for (const word of words) {
      this.insertWord(root, word);
    }

    // 原子替换 Trie 树
    this.trieRoot = root;
    this.logger.log(`DFA Trie 树构建完成，共加载 ${words.length} 个敏感词`);
  }

  /**
   * 向 Trie 树插入一个敏感词
   */
  private insertWord(root: TrieNode, word: SensitiveWord): void {
    let node = root;
    const chars = word.word.split('');

    for (const char of chars) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false });
      }
      node = node.children.get(char)!;
    }

    node.isEnd = true;
    node.wordInfo = {
      word: word.word,
      category: word.category,
      severity: word.severity,
    };
  }

  /**
   * 检查文本中是否包含敏感词（DFA Trie 树匹配）
   * 时间复杂度 O(n)，n 为文本长度
   *
   * @param text 待检查的文本
   * @returns 匹配结果 { hasSensitive: boolean, hits: Array<{word, category, severity, position}> }
   */
  checkText(text: string): {
    hasSensitive: boolean;
    hits: Array<{ word: string; category: string; severity: string; position: number }>;
  } {
    const hits: Array<{ word: string; category: string; severity: string; position: number }> = [];
    const chars = text.split('');
    const length = chars.length;

    // DFA 多模式匹配
    for (let i = 0; i < length; i++) {
      let node = this.trieRoot;
      let j = i;

      while (j < length && node.children.has(chars[j])) {
        node = node.children.get(chars[j])!;
        j++;

        if (node.isEnd && node.wordInfo) {
          hits.push({
            word: node.wordInfo.word,
            category: node.wordInfo.category,
            severity: node.wordInfo.severity,
            position: i,
          });
        }
      }

      // 如果没有匹配到任何字符，继续下一个位置
      if (j === i) {
        continue;
      }
    }

    return {
      hasSensitive: hits.length > 0,
      hits,
    };
  }

  /**
   * 批量导入敏感词
   * @param words 敏感词数组 [{word, category, severity}]
   */
  async batchImport(
    words: Array<{ word: string; category: string; severity: string }>,
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const item of words) {
      // 检查是否已存在
      const existing = await this.sensitiveWordRepository.findOne({
        where: { word: item.word },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const entity = this.sensitiveWordRepository.create({
        word: item.word,
        category: item.category,
        severity: item.severity || 'MEDIUM',
        isEnabled: true,
      });

      await this.sensitiveWordRepository.save(entity);
      imported++;
    }

    // 重新构建 Trie 树
    await this.buildTrie();

    this.logger.log(`批量导入敏感词完成: 导入=${imported}, 跳过=${skipped}`);
    return { imported, skipped };
  }

  /**
   * 获取所有敏感词列表
   */
  async findAll(): Promise<SensitiveWord[]> {
    return this.sensitiveWordRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 创建敏感词
   */
  async create(data: Partial<SensitiveWord>): Promise<SensitiveWord> {
    const entity = this.sensitiveWordRepository.create(data);
    const saved = await this.sensitiveWordRepository.save(entity);
    await this.buildTrie();
    this.logger.log(`创建敏感词: ${saved.word}`);
    return saved;
  }

  /**
   * 删除敏感词
   */
  async remove(id: string): Promise<void> {
    await this.sensitiveWordRepository.delete(id);
    await this.buildTrie();
    this.logger.log(`删除敏感词: id=${id}`);
  }
}