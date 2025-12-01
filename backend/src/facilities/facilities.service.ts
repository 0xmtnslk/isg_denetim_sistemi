import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto) {
    return this.prisma.facility.create({
      data: createFacilityDto,
      include: { group: true },
    });
  }

  async findAll() {
    return this.prisma.facility.findMany({
      include: { group: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByGroup(groupId: number) {
    return this.prisma.facility.findMany({
      where: { groupId },
      include: { group: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!facility) {
      throw new NotFoundException('Tesis bulunamadı');
    }

    return facility;
  }

  async update(id: number, updateFacilityDto: UpdateFacilityDto) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException('Tesis bulunamadı');
    }

    return this.prisma.facility.update({
      where: { id },
      data: updateFacilityDto,
      include: { group: true },
    });
  }

  async remove(id: number) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException('Tesis bulunamadı');
    }

    await this.prisma.facility.delete({ where: { id } });
    return { message: 'Tesis başarıyla silindi' };
  }
}
