import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [PhotosService, PrismaService],
  exports: [PhotosService],
})
export class PhotosModule {}
