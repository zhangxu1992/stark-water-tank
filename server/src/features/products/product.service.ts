import { ProductRepository } from './product.repository';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { CreateProductInput, UpdateProductInput } from './product.dto';

export class ProductService {
  constructor(private repo: ProductRepository) {}

  async list(params: { categoryId?: string; page?: number; limit?: number }) {
    return this.repo.findAll(params);
  }

  async listAdmin(params: { categoryId?: string; page?: number; limit?: number }) {
    return this.repo.findAllAdmin(params);
  }

  async getBySlug(slug: string) {
    const product = await this.repo.findBySlug(slug);
    if (!product) throw new NotFoundError('Product', slug);
    return product;
  }

  async create(input: CreateProductInput) {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ConflictError(`Product slug "${input.slug}" already exists`);

    return this.repo.create({
      categoryId: input.categoryId,
      slug: input.slug,
      translations: JSON.stringify(input.translations),
      parameters: JSON.stringify(input.parameters),
      industries: JSON.stringify(input.industries),
      images: JSON.stringify(input.images),
      coverImage: input.coverImage,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    });
  }

  async update(id: string, input: UpdateProductInput) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError('Product', id);

    if (input.slug && input.slug !== product.slug) {
      const existing = await this.repo.findBySlug(input.slug);
      if (existing) throw new ConflictError(`Product slug "${input.slug}" already exists`);
    }

    const data: any = {};
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.translations !== undefined) data.translations = JSON.stringify(input.translations);
    if (input.parameters !== undefined) data.parameters = JSON.stringify(input.parameters);
    if (input.industries !== undefined) data.industries = JSON.stringify(input.industries);
    if (input.images !== undefined) data.images = JSON.stringify(input.images);
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;
    if (input.metaKeywords !== undefined) data.metaKeywords = input.metaKeywords;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError('Product', id);
    await this.repo.delete(id);
  }
}
