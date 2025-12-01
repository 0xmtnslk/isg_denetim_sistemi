import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';
import { PdfService } from './pdf.service';
import { PrismaService } from '../common/prisma.service';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [
    PhotosModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [AuditsController],
  providers: [AuditsService, PdfService, PrismaService],
})
export class AuditsModule {}
