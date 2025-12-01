import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
      include: { section: true },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        section: true,
        questions: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findBySection(sectionId: number) {
    return this.prisma.category.findMany({
      where: { sectionId },
      include: {
        questions: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        section: true,
        questions: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Kategori başarıyla silindi' };
  }
}
