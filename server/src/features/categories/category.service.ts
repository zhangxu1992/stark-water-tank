import { CategoryRepository } from './category.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { CreateCategoryInput, UpdateCategoryInput } from './category.dto';

export type CategoryType = 'product' | 'news' | 'case';

export class CategoryService {
  constructor(private repo: CategoryRepository) {}

  async list(type: CategoryType) {
    return this.repo.findAll(type);
  }

  async create(input: CreateCategoryInput) {
    const existing = await this.repo.findBySlug(input.type, input.slug);
    if (existing) {
      throw new ConflictError(`Category slug "${input.slug}" already exists`);
    }

    const data = {
      name: input.name,
      slug: input.slug,
      translations: JSON.stringify(input.translations),
      sortOrder: input.sortOrder,
    };

    return this.repo.create(input.type, data);
  }

  async update(type: CategoryType, id: string, input: UpdateCategoryInput) {
    const existing = await this.repo.findById(type, id);
    if (!existing) {
      throw new NotFoundError('Category', id);
    }

    if (input.slug && input.slug !== (existing as any).slug) {
      const slugExists = await this.repo.findBySlug(type, input.slug);
      if (slugExists) {
        throw new ConflictError(`Category slug "${input.slug}" already exists`);
      }
    }

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.translations !== undefined) data.translations = JSON.stringify(input.translations);
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.repo.update(type, id, data);
  }

  async delete(type: CategoryType, id: string) {
    const existing = await this.repo.findById(type, id);
    if (!existing) {
      throw new NotFoundError('Category', id);
    }

    // Check if has children
    const relationMap: Record<string, { table: string; field: string }> = {
      product: { table: 'product', field: 'categoryId' },
      news:    { table: 'news',    field: 'categoryId' },
      case:    { table: 'case',    field: 'categoryId' },
    };
    const rel = relationMap[type];
    const count = await (this.repo as any).prisma[rel.table].count({
      where: { [rel.field]: id },
    });
    if (count > 0) {
      throw new ConflictError(`Cannot delete category with existing ${type}s. Remove or reassign first.`);
    }

    await this.repo.delete(type, id);
  }
}
