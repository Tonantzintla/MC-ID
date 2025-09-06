import { IsString, Length, Matches } from 'class-validator';

export default class VerifyCodeDto {
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

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Code must be a 6-digit number',
  })
  code: string;
}
