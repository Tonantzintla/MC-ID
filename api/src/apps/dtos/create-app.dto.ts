import {
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';

export class CreateAppDto {
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty or just spaces' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsString()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'Description cannot be empty or just spaces if provided',
  })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description?: string;
}
