import { NewsRepository } from './news.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { CreateNewsInput, UpdateNewsInput } from './news.dto';

export class NewsService {
  constructor(private repo: NewsRepository) {}

  async list(params: { categoryId?: string; page?: number; limit?: number }) {
    return this.repo.findAll(params);
  }

  async listAdmin(params: { categoryId?: string; page?: number; limit?: number }) {
    return this.repo.findAllAdmin(params);
  }

  async getBySlug(slug: string) {
    const item = await this.repo.findBySlug(slug);
    if (!item) throw new NotFoundError('News', slug);
    return item;
  }

  async create(input: CreateNewsInput) {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError(`News slug "${input.slug}" already exists`);

    return this.repo.create({
      categoryId: input.categoryId,
      slug: input.slug,
      translations: JSON.stringify(input.translations),
      coverImage: input.coverImage,
      isPublished: input.isPublished,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
    });
  }

  async update(id: string, input: UpdateNewsInput) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('News', id);

    if (input.slug && input.slug !== item.slug) {
      const existing = await this.repo.findBySlug(input.slug);
      if (existing) throw new ConflictError(`News slug "${input.slug}" already exists`);
    }

    const data: any = {};
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.translations !== undefined) data.translations = JSON.stringify(input.translations);
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.publishedAt !== undefined) data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : undefined;

    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('News', id);
    await this.repo.delete(id);
  }
}
