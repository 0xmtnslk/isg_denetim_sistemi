import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PhotosService } from '../photos/photos.service';
import {
  CreateAuditDto,
  UpdateAuditDto,
  SaveAnswerDto,
  CompleteAuditDto,
} from './dto/audit.dto';
import { AnswerType, AuditStatus } from '@prisma/client';

@Injectable()
export class AuditsService {
  constructor(
    private prisma: PrismaService,
    private photosService: PhotosService,
  ) {}

  async create(createAuditDto: CreateAuditDto, userId: number) {
    // Template ve Facility kontrolü
    const template = await this.prisma.template.findUnique({
      where: { id: createAuditDto.templateId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id: createAuditDto.facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Tesis bulunamadı');
    }

    // Denetim oluştur
    const audit = await this.prisma.audit.create({
      data: {
        facilityId: createAuditDto.facilityId,
        templateId: createAuditDto.templateId,
        userId,
        auditDate: createAuditDto.auditDate || new Date(),
        status: AuditStatus.DRAFT,
      },
      include: {
        facility: {
          include: { group: true },
        },
        template: {
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
            },
          },
        },
        auditor: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return audit;
  }

  async findAll(userId?: number, role?: string) {
    // Admin tüm denetimleri görebilir
    // Diğerleri sadece kendi denetimlerini
    const where: any = {};
    
    if (role !== 'ADMIN') {
      where.userId = userId;
    }

    return this.prisma.audit.findMany({
      where,
      include: {
        facility: {
          include: { group: true },
        },
        template: true,
        auditor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        answers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: {
        facility: {
          include: { group: true },
        },
        template: {
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
        },
        auditor: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        answers: {
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
            photos: true,
          },
        },
      },
    });

    if (!audit) {
      throw new NotFoundException('Denetim bulunamadı');
    }

    return audit;
  }

  async saveAnswer(
    auditId: number,
    saveAnswerDto: SaveAnswerDto,
    photos?: Express.Multer.File[],
  ) {
    const audit = await this.prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      throw new NotFoundException('Denetim bulunamadı');
    }

    // Tamamlanmış denetim düzenlenemez
    if (audit.status === AuditStatus.COMPLETED) {
      throw new BadRequestException('Tamamlanmış denetim düzenlenemez');
    }

    // Cevap tipine göre fotoğraf ve açıklama kontrolü
    if (
      saveAnswerDto.answerType === AnswerType.KISMEN_KARSILYOR ||
      saveAnswerDto.answerType === AnswerType.KARSILAMIYOR
    ) {
      if (!saveAnswerDto.explanation || saveAnswerDto.explanation.trim() === '') {
        throw new BadRequestException('Bu cevap tipi için açıklama zorunludur');
      }
      if (!photos || photos.length === 0) {
        throw new BadRequestException('Bu cevap tipi için en az bir fotoğraf gereklidir');
      }
    }

    // Cevabı kaydet veya güncelle
    const answer = await this.prisma.auditAnswer.upsert({
      where: {
        auditId_questionId: {
          auditId,
          questionId: saveAnswerDto.questionId,
        },
      },
      update: {
        answerType: saveAnswerDto.answerType,
        explanation: saveAnswerDto.explanation,
      },
      create: {
        auditId,
        questionId: saveAnswerDto.questionId,
        answerType: saveAnswerDto.answerType,
        explanation: saveAnswerDto.explanation,
      },
    });

    // Fotoğrafları kaydet
    if (photos && photos.length > 0) {
      // Önce eski fotoğrafları sil
      const oldPhotos = await this.prisma.photo.findMany({
        where: { auditAnswerId: answer.id },
      });
      for (const photo of oldPhotos) {
        await this.photosService.remove(photo.id);
      }

      // Yeni fotoğrafları kaydet
      for (const photo of photos) {
        await this.photosService.savePhoto(answer.id, photo);
      }
    }

    return this.findOne(auditId);
  }

  async complete(auditId: number) {
    const audit = await this.findOne(auditId);

    // Tüm soruların cevaplanıp cevaplanmadığını kontrol et
    const templateQuestions = audit.template.questions;
    const answeredQuestions = audit.answers;

    if (answeredQuestions.length < templateQuestions.length) {
      throw new BadRequestException(
        `Tüm sorular cevaplanmalıdır. ${answeredQuestions.length}/${templateQuestions.length} soru cevaplanmış.`,
      );
    }

    // TW skorunu hesapla
    const totalScore = this.calculateScore(audit);

    // Denetimi tamamla
    await this.prisma.audit.update({
      where: { id: auditId },
      data: {
        status: AuditStatus.COMPLETED,
        totalScore,
      },
    });

    return this.findOne(auditId);
  }

  private calculateScore(audit: any): number {
    // Bölüm bazında skor hesapla
    const sectionScores: { [sectionId: number]: { earned: number; max: number } } = {};

    for (const answer of audit.answers) {
      const question = answer.question;
      const sectionId = question.category.section.id;

      // Kapsam dışı cevapları atla
      if (answer.answerType === AnswerType.KAPSAM_DISI) {
        continue;
      }

      if (!sectionScores[sectionId]) {
        sectionScores[sectionId] = { earned: 0, max: 0 };
      }

      // Maksimum puan
      sectionScores[sectionId].max += question.twScore * 3;

      // Kazanılan puan
      let multiplier = 0;
      if (answer.answerType === AnswerType.KARSILYOR) {
        multiplier = 3;
      } else if (answer.answerType === AnswerType.KISMEN_KARSILYOR) {
        multiplier = 1;
      } else if (answer.answerType === AnswerType.KARSILAMIYOR) {
        multiplier = 0;
      }

      sectionScores[sectionId].earned += question.twScore * multiplier;
    }

    // Genel skoru hesapla (tüm bölümlerin ortalaması)
    const sectionScorePercentages = Object.values(sectionScores).map((score) => {
      if (score.max === 0) return 0;
      return (score.earned / score.max) * 100;
    });

    if (sectionScorePercentages.length === 0) {
      return 0;
    }

    const totalScore =
      sectionScorePercentages.reduce((sum, score) => sum + score, 0) /
      sectionScorePercentages.length;

    return Math.round(totalScore * 100) / 100; // 2 ondalık basamak
  }

  async update(id: number, updateAuditDto: UpdateAuditDto) {
    const audit = await this.prisma.audit.findUnique({ where: { id } });
    if (!audit) {
      throw new NotFoundException('Denetim bulunamadı');
    }

    if (audit.status === AuditStatus.COMPLETED) {
      throw new BadRequestException('Tamamlanmış denetim düzenlenemez');
    }

    return this.prisma.audit.update({
      where: { id },
      data: updateAuditDto,
    });
  }

  async remove(id: number) {
    const audit = await this.prisma.audit.findUnique({ where: { id } });
    if (!audit) {
      throw new NotFoundException('Denetim bulunamadı');
    }

    await this.prisma.audit.delete({ where: { id } });
    return { message: 'Denetim başarıyla silindi' };
  }

  // Analiz ve istatistik için
  async getStatistics(facilityId?: number, startDate?: Date, endDate?: Date) {
    const where: any = {
      status: AuditStatus.COMPLETED,
    };

    if (facilityId) {
      where.facilityId = facilityId;
    }

    if (startDate || endDate) {
      where.auditDate = {};
      if (startDate) where.auditDate.gte = startDate;
      if (endDate) where.auditDate.lte = endDate;
    }

    const audits = await this.prisma.audit.findMany({
      where,
      include: {
        facility: {
          include: { group: true },
        },
        answers: {
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
        },
      },
      orderBy: { auditDate: 'desc' },
    });

    // İstatistikleri hesapla
    const statistics = {
      totalAudits: audits.length,
      averageScore:
        audits.reduce((sum, audit) => sum + (audit.totalScore || 0), 0) / audits.length || 0,
      scoresByFacility: {},
      scoresBySection: {},
      answerDistribution: {
        KARSILYOR: 0,
        KISMEN_KARSILYOR: 0,
        KARSILAMIYOR: 0,
        KAPSAM_DISI: 0,
      },
    };

    // Cevap dağılımını hesapla
    for (const audit of audits) {
      for (const answer of audit.answers) {
        statistics.answerDistribution[answer.answerType]++;
      }
    }

    return statistics;
  }
}
