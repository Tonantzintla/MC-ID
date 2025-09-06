import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  GetCodeNotFoundDto,
  GetCodeSuccessDto,
  GetCodeUnauthorizedDto,
} from '../response-dtos/get-code.dto';

export function getCodeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get code from plugin by UUID',
      description:
        'Retrieve the code from the plugin associated with a specific user UUID.',
    }),
    ApiBearerAuth('PluginKey'),
    ApiOkResponse({
      description: 'Code retrieved successfully.',
      type: GetCodeSuccessDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Key in the request header is invalid or missing.',
      type: GetCodeUnauthorizedDto,
    }),
    ApiNotFoundResponse({
      description: 'Plugin not found for the given user UUID.',
      type: GetCodeNotFoundDto,
    }),
  );
}
