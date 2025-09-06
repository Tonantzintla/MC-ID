import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { AppDto } from '../response-dtos/app.dto';
import { NotFoundDto } from '../response-dtos/not-found.dto';

export function DeleteAppDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete application by ID',
      description: 'Delete a specific application by its ID.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiNotFoundResponse({
      description: 'Application not found',
      type: NotFoundDto,
    }),
    ApiOkResponse({
      description: 'Application deleted successfully.',
      type: AppDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
  );
}
