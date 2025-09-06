import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedDto } from '../response-dtos/unauthorized.dto';
import { ResetSecretDto } from '../response-dtos/reset-secret.dto';
import { NotFoundDto } from '../response-dtos/not-found.dto';

export function ResetSecretDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reset application secret',
      description: 'Reset the secret for the specified application.',
    }),
    ApiBearerAuth('JWTBearerAuth'),
    ApiOkResponse({
      description: 'Secret reset successfully.',
      type: ResetSecretDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedDto,
    }),
    ApiNotFoundResponse({
      description: 'App not found',
      type: NotFoundDto,
    }),
  );
}
