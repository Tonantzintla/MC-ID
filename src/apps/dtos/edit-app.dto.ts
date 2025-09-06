import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class EditAppDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty or just spaces' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'Description cannot be empty or just spaces if provided',
  })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description?: string;
}
