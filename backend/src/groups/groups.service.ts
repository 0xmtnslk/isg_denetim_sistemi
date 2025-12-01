import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    const existing = await this.prisma.group.findUnique({
      where: { name: createGroupDto.name },
    });

    if (existing) {
      throw new ConflictException('Bu isimde bir grup zaten mevcut');
    }

    return this.prisma.group.create({ data: createGroupDto });
  }

  async findAll() {
    return this.prisma.group.findMany({
      include: {
        facilities: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        facilities: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Grup bulunamadı');
    }

    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Grup bulunamadı');
    }

    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existing = await this.prisma.group.findUnique({
        where: { name: updateGroupDto.name },
      });
      if (existing) {
        throw new ConflictException('Bu isimde bir grup zaten mevcut');
      }
    }

    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
    });
  }

  async remove(id: number) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Grup bulunamadı');
    }

    await this.prisma.group.delete({ where: { id } });
    return { message: 'Grup başarıyla silindi' };
  }
}
