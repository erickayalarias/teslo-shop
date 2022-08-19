import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { paginationDto } from '../common/dto/pagination.dto';
import { validate } from 'uuid';
import { ProductImage, Product } from './entities';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productsImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productsRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productsImageRepository.create({ url: image }),
        ),
      });
      // lo guarda en la base de datos
      await this.productsRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: paginationDto) {
    const { offset = 0, limit = 10 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (validate(term)) {
      product = await this.productsRepository.findOne({
        where: { id: term },
      });
    } else {
      const queryBuilder =
        this.productsRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    return product;
  }

  async findOnePLain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productsRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    // Connect query runner to a database
    await queryRunner.connect();
    // Start transaction
    await queryRunner.startTransaction();
    try {
      if (images) {
        // Delete old images
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });
        product.images = images.map((image) =>
          this.productsImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productsRepository.save(product);
      return this.findOnePLain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    this.productsRepository.remove(product);
  }
  private handleError(error: any) {
    if (error.code === '23505')
      throw new InternalServerErrorException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error');
  }
  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleError(error);
    }
  }
}
