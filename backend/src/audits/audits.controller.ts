import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuditsService } from './audits.service';
import { PdfService } from './pdf.service';
import { CreateAuditDto, UpdateAuditDto, SaveAnswerDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditsController {
  constructor(
    private readonly auditsService: AuditsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ISG_UZMANI, UserRole.DENETCI)
  create(@Body() createAuditDto: CreateAuditDto, @CurrentUser() user) {
    return this.auditsService.create(createAuditDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.auditsService.findAll(user.id, user.role);
  }

  @Get('statistics')
  getStatistics(
    @Query('facilityId') facilityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditsService.getStatistics(
      facilityId ? +facilityId : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditsService.findOne(+id);
  }

  @Post(':id/answers')
  @Roles(UserRole.ADMIN, UserRole.ISG_UZMANI, UserRole.DENETCI)
  @UseInterceptors(FilesInterceptor('photos', 10))
  saveAnswer(
    @Param('id') id: string,
    @Body() saveAnswerDto: SaveAnswerDto,
    @UploadedFiles() photos?: Express.Multer.File[],
  ) {
    return this.auditsService.saveAnswer(+id, saveAnswerDto, photos);
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.ISG_UZMANI, UserRole.DENETCI)
  complete(@Param('id') id: string) {
    return this.auditsService.complete(+id);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const audit = await this.auditsService.findOne(+id);
    const pdfBuffer = await this.pdfService.generateAuditReport(audit);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="denetim-${audit.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ISG_UZMANI, UserRole.DENETCI)
  update(@Param('id') id: string, @Body() updateAuditDto: UpdateAuditDto) {
    return this.auditsService.update(+id, updateAuditDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.auditsService.remove(+id);
  }
}
