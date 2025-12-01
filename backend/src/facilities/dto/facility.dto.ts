import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  groupId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFacilityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  groupId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
