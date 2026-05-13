import { PrismaClient, Prisma } from '@prisma/client';

export class CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(type: 'product' | 'news') {
    if (type === 'product') {
      return this.prisma.productCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      });
    }
    return this.prisma.newsCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { news: true } } },
    });
  }

  async findById(type: 'product' | 'news', id: string) {
    if (type === 'product') {
      return this.prisma.productCategory.findUnique({ where: { id } });
    }
    return this.prisma.newsCategory.findUnique({ where: { id } });
  }

  async findBySlug(type: 'product' | 'news', slug: string) {
    if (type === 'product') {
      return this.prisma.productCategory.findUnique({ where: { slug } });
    }
    return this.prisma.newsCategory.findUnique({ where: { slug } });
  }

  async create(type: 'product' | 'news', data: any) {
    if (type === 'product') {
      return this.prisma.productCategory.create({ data });
    }
    return this.prisma.newsCategory.create({ data });
  }

  async update(type: 'product' | 'news', id: string, data: any) {
    if (type === 'product') {
      return this.prisma.productCategory.update({ where: { id }, data });
    }
    return this.prisma.newsCategory.update({ where: { id }, data });
  }

  async delete(type: 'product' | 'news', id: string) {
    if (type === 'product') {
      await this.prisma.productCategory.delete({ where: { id } });
    } else {
      await this.prisma.newsCategory.delete({ where: { id } });
    }
  }
}
