import { PrismaClient } from '@prisma/client';

export class FaqRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.faq.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.faq.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.faq.delete({ where: { id } });
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    for (const item of items) {
      await this.prisma.faq.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } });
    }
  }
}
