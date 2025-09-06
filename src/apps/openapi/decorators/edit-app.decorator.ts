import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { AppDto } from '../response-dtos/app.dto';
import { BadRequestDto } from '../response-dtos/bad-request.dto';

export function EditAppDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit an existing application',
      description: 'Edit an existing application via id.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: BadRequestDto,
    }),
    ApiOkResponse({
      description: 'Application edited successfully. (Secret is hashed)',
      type: AppDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
  );
}
