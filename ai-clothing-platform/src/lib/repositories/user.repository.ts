/**
 * UserRepository - 用户仓储
 */

import { prisma } from '@/lib/prisma';
import { User, UserRole, Prisma } from '@prisma/client';

export interface CreateUserInput {
  feishuUserId?: string;
  feishuOpenId?: string;
  feishuUnionId?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
}

export class UserRepository {
  /**
   * 创建用户
   */
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * 通过ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 通过飞书用户ID查找用户
   */
  async findByFeishuUserId(feishuUserId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { feishuUserId },
    });
  }

  /**
   * 通过邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 更新用户
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 查询用户列表
   */
  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    return prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * 统计用户数量
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }

  /**
   * 通过飞书信息查找或创建用户
   */
  async findOrCreateByFeishu(data: {
    feishuUserId: string;
    feishuOpenId?: string;
    feishuUnionId?: string;
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<User> {
    // 先尝试查找
    let user = await this.findByFeishuUserId(data.feishuUserId);

    // 如果不存在则创建
    if (!user) {
      user = await this.create({
        feishuUserId: data.feishuUserId,
        feishuOpenId: data.feishuOpenId,
        feishuUnionId: data.feishuUnionId,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
    }

    return user;
  }
}

// 创建单例实例
let userRepositoryInstance: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
}
