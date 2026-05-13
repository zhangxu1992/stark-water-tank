import { PrismaClient } from '@prisma/client';

export class NewsRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params: { categoryId?: string; page?: number; limit?: number }) {
    const { categoryId, page = 1, limit = 20 } = params;
    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = categoryId;

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllAdmin(params: { categoryId?: string; page?: number; limit?: number }) {
    const { categoryId, page = 1, limit = 20 } = params;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.news.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    return this.prisma.news.findUnique({ where: { slug }, include: { category: true } });
  }

  async findById(id: string) {
    return this.prisma.news.findUnique({ where: { id }, include: { category: true } });
  }

  async create(data: any) {
    return this.prisma.news.create({ data, include: { category: true } });
  }

  async update(id: string, data: any) {
    return this.prisma.news.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: string) {
    await this.prisma.news.delete({ where: { id } });
  }
}
