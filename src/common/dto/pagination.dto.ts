import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class paginationDto {
  @IsOptional()
  @Type(() => Number)
  offset?: number;
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;
}
