import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CodesService } from './codes.service';
import RequestCodeDto from './dtos/request-code.dto';
import VerifyCodeDto from './dtos/verify-code.dto';
import { Throttle } from '@nestjs/throttler';
import { AppGuard } from 'src/apps/guards/app.guard';
import { AppThrottlerGuard } from 'src/apps/guards/throttler.guard';
import { RequestCodeDoc, VerifyCodeDoc } from './openapi/decorators';

@Controller('codes')
@UseGuards(AppGuard, AppThrottlerGuard)
@Throttle({ app: {} })
export class CodesController {
  constructor(private codesService: CodesService) {}

  @RequestCodeDoc()
  @Post('request')
  requestCode(@Body() requestCodeDto: RequestCodeDto) {
    return this.codesService.requestCode(requestCodeDto);
  }

  @VerifyCodeDoc()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.codesService.verifyCode(verifyCodeDto);
  }
}
