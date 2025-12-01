import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto) {
    const existing = await this.prisma.section.findUnique({
      where: { name: createSectionDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir bölüm zaten mevcut');
    }

    return this.prisma.section.create({
      data: createSectionDto,
      include: { categories: true },
    });
  }

  async findAll() {
    return this.prisma.section.findMany({
      include: {
        categories: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Bölüm bulunamadı');
    }

    return section;
  }

  async update(id: number, updateSectionDto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException('Bölüm bulunamadı');
    }

    if (updateSectionDto.name && updateSectionDto.name !== section.name) {
      const existing = await this.prisma.section.findUnique({
        where: { name: updateSectionDto.name },
      });
      if (existing) {
        throw new ConflictException('Bu isimde bir bölüm zaten mevcut');
      }
    }

    return this.prisma.section.update({
      where: { id },
      data: updateSectionDto,
    });
  }

  async remove(id: number) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException('Bölüm bulunamadı');
    }

    await this.prisma.section.delete({ where: { id } });
    return { message: 'Bölüm başarıyla silindi' };
  }
}
