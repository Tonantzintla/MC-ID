import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
@ApiSchema({ description: 'Description of the CreateCatDto schema' })
export default class RequestCodeDto {
  @ApiProperty()
  @IsString()
  @Length(24, 30, {
    message: 'App ID must be a valid CUID2 (24-30 characters long).',
  })
  appId: string;

  @IsString()
  @Length(32, 128, {
    message: 'App secret must be 32 characters or longer.',
  })
  appSecret: string;

  @IsString()
  @Matches(/^[0-9a-f]{32}$/, { message: 'Invalid Minecraft UUID format' })
  uuid: string;
}
