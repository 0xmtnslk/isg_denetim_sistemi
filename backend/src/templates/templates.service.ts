import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, AddQuestionsDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const existing = await this.prisma.template.findUnique({
      where: { name: createTemplateDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir şablon zaten mevcut');
    }

    const { questionIds, ...templateData } = createTemplateDto;

    const template = await this.prisma.template.create({
      data: templateData,
    });

    // Soruları ekle
    if (questionIds && questionIds.length > 0) {
      await this.addQuestions(template.id, { questionIds });
    }

    return this.findOne(template.id);
  }

  async findAll() {
    return this.prisma.template.findMany({
      include: {
        questions: {
          include: {
            question: {
              include: {
                category: {
                  include: {
                    section: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              include: {
                category: {
                  include: {
                    section: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    return template;
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    if (updateTemplateDto.name && updateTemplateDto.name !== template.name) {
      const existing = await this.prisma.template.findUnique({
        where: { name: updateTemplateDto.name },
      });
      if (existing) {
        throw new ConflictException('Bu isimde bir şablon zaten mevcut');
      }
    }

    const { questionIds, ...templateData } = updateTemplateDto;

    const updated = await this.prisma.template.update({
      where: { id },
      data: templateData,
    });

    // Sorular güncellenmek isteniyorsa
    if (questionIds) {
      // Önce mevcut soruları sil
      await this.prisma.templateQuestion.deleteMany({
        where: { templateId: id },
      });

      // Yeni soruları ekle
      if (questionIds.length > 0) {
        await this.addQuestions(id, { questionIds });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    await this.prisma.template.delete({ where: { id } });
    return { message: 'Şablon başarıyla silindi' };
  }

  async addQuestions(templateId: number, addQuestionsDto: AddQuestionsDto) {
    const template = await this.prisma.template.findUnique({ where: { id: templateId } });
    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    // Soruları ekle
    const templateQuestions = addQuestionsDto.questionIds.map((questionId, index) => ({
      templateId,
      questionId,
      order: index + 1,
    }));

    await this.prisma.templateQuestion.createMany({
      data: templateQuestions,
      skipDuplicates: true,
    });

    return this.findOne(templateId);
  }

  async removeQuestion(templateId: number, questionId: number) {
    await this.prisma.templateQuestion.delete({
      where: {
        templateId_questionId: {
          templateId,
          questionId,
        },
      },
    });

    return this.findOne(templateId);
  }
}
