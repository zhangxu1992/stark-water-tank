import { PrismaClient } from '@prisma/client';

export class CaseRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const where = { isPublished: true };

    const [items, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.case.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllAdmin(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;

    const [items, total] = await Promise.all([
      this.prisma.case.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.case.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    return this.prisma.case.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return this.prisma.case.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.case.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.case.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.case.delete({ where: { id } });
  }
}
