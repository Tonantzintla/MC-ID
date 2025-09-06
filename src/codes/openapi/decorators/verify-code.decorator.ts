import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { VerifyCodeSuccessDto } from '../response-dtos/verify-code.dto';
import { BadRequestDto } from '../response-dtos/bad-request.dto';

export function VerifyCodeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify authentication code for app',
      description: 'Verify an authentication code for an application.',
    }),
    ApiUnauthorizedResponse({
      description: 'Missing App ID or App Secret or invalid code.',
      type: UnauthorizedDto,
    }),
    ApiOkResponse({
      description: 'Code verified successfully.',
      type: VerifyCodeSuccessDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data.',
      type: BadRequestDto,
    }),
  );
}
