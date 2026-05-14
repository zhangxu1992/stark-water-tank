import { FaqRepository } from './faq.repository';
import { NotFoundError } from '../../shared/errors';
import { CreateFaqInput, UpdateFaqInput } from './faq.dto';

export class FaqService {
  constructor(private repo: FaqRepository) {}

  async list() { return this.repo.findAll(); }
  async listAdmin() { return this.repo.findAllAdmin(); }

  async create(input: CreateFaqInput) {
    return this.repo.create({
      translations: JSON.stringify(input.translations),
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    });
  }

  async update(id: string, input: UpdateFaqInput) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError('FAQ', id);
    const data: any = {};
    if (input.translations !== undefined) data.translations = JSON.stringify(input.translations);
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;
    if (input.metaKeywords !== undefined) data.metaKeywords = input.metaKeywords;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    return this.repo.update(id, data);
  }

  async delete(id: string) {
    if (!await this.repo.findById(id)) throw new NotFoundError('FAQ', id);
    await this.repo.delete(id);
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.repo.reorder(items);
  }
}
