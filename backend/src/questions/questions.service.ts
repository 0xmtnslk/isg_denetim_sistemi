import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: createQuestionDto,
      include: {
        category: {
          include: {
            section: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        category: {
          include: {
            section: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.question.findMany({
      where: { categoryId },
      include: {
        category: {
          include: {
            section: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Soru bulunamadı');
    }

    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException('Soru bulunamadı');
    }

    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: number) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException('Soru bulunamadı');
    }

    await this.prisma.question.delete({ where: { id } });
    return { message: 'Soru başarıyla silindi' };
  }
}
