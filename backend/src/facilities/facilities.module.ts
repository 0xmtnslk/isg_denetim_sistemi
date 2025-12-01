import { Module } from '@nestjs/common';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [FacilitiesController],
  providers: [FacilitiesService, PrismaService],
})
export class FacilitiesModule {}
