import { IsNumber, IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { AnswerType } from '@prisma/client';

export class CreateAuditDto {
  @IsNumber()
  facilityId: number;

  @IsNumber()
  templateId: number;

  @IsDateString()
  @IsOptional()
  auditDate?: Date;
}

export class UpdateAuditDto {
  @IsDateString()
  @IsOptional()
  auditDate?: Date;
}

export class SaveAnswerDto {
  @IsNumber()
  questionId: number;

  @IsEnum(AnswerType)
  answerType: AnswerType;

  @IsString()
  @IsOptional()
  explanation?: string;
}

export class CompleteAuditDto {
  // Boş - sadece işlemi tetiklemek için
}
