import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { AppDto } from '../response-dtos/app.dto';
import { BadRequestDto } from '../response-dtos/bad-request.dto';

export function CreateAppDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new application',
      description: 'Create a new application.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: BadRequestDto,
    }),
    ApiCreatedResponse({
      description: 'Application created successfully.',
      type: AppDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
  );
}
