import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PhotosService {
  private uploadPath = join(process.cwd(), 'uploads', 'audit-photos');

  constructor(private prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadPath)) {
      await mkdir(this.uploadPath, { recursive: true });
    }
  }

  async savePhoto(auditAnswerId: number, file: Express.Multer.File) {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = join(this.uploadPath, filename);

    await writeFile(filepath, file.buffer);

    const photo = await this.prisma.photo.create({
      data: {
        auditAnswerId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filepath,
      },
    });

    return photo;
  }

  async findByAuditAnswer(auditAnswerId: number) {
    return this.prisma.photo.findMany({
      where: { auditAnswerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: number) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (photo) {
      await this.prisma.photo.delete({ where: { id } });
      // Dosyayı silme işlemi opsiyonel (disk temizliği için)
    }
  }
}
