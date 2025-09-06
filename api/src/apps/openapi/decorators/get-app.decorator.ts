import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { NotFoundDto } from '../response-dtos/not-found.dto';
import { AppDto } from '../response-dtos/app.dto';

export function GetAppDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get application by ID',
      description: 'Retrieve details of a specific application by its ID.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiNotFoundResponse({
      description: 'Application not found',
      type: NotFoundDto,
    }),
    ApiOkResponse({
      description: 'Application retrieved successfully. (Secret is hashed)',
      type: AppDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
  );
}
