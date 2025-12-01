import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  twScore: number;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  twScore?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
