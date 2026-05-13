import { CaseRepository } from './case.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { CreateCaseInput, UpdateCaseInput } from './case.dto';

export class CaseService {
  constructor(private repo: CaseRepository) {}

  async list(params: { page?: number; limit?: number }) {
    return this.repo.findAll(params);
  }

  async listAdmin(params: { page?: number; limit?: number }) {
    return this.repo.findAllAdmin(params);
  }

  async getBySlug(slug: string) {
    const item = await this.repo.findBySlug(slug);
    if (!item) throw new NotFoundError('Case', slug);
    return item;
  }

  async create(input: CreateCaseInput) {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError(`Case slug "${input.slug}" already exists`);

    return this.repo.create({
      slug: input.slug,
      translations: JSON.stringify(input.translations),
      images: JSON.stringify(input.images),
      coverImage: input.coverImage,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    });
  }

  async update(id: string, input: UpdateCaseInput) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('Case', id);

    if (input.slug && input.slug !== item.slug) {
      const existing = await this.repo.findBySlug(input.slug);
      if (existing) throw new ConflictError(`Case slug "${input.slug}" already exists`);
    }

    const data: any = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.translations !== undefined) data.translations = JSON.stringify(input.translations);
    if (input.images !== undefined) data.images = JSON.stringify(input.images);
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('Case', id);
    await this.repo.delete(id);
  }
}
