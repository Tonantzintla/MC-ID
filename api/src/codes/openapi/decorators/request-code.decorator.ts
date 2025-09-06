import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestDto } from '../response-dtos/bad-request.dto';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { RequestCodeSuccessDto } from '../response-dtos/request-code.dto';

export function RequestCodeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request authentication code for app',
      description: 'Request an authentication code for an application.',
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data.',
      type: BadRequestDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Missing App ID or App Secret.',
      type: UnauthorizedDto,
    }),
    ApiCreatedResponse({
      description: 'Code requested successfully.',
      type: RequestCodeSuccessDto,
    }),
  );
}
