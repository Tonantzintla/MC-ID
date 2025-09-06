import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { AppDto } from '../response-dtos/app.dto';

export function GetAppsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all applications for user',
      description: 'Retrieve all applications for the authenticated user.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiOkResponse({
      description: 'Applications retrieved successfully. (Secrets are hashed)',
      type: AppDto,
      isArray: true,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
  );
}
