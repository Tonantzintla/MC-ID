import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dtos/create-app.dto';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateAppDoc,
  DeleteAppDoc,
  EditAppDoc,
  GetAppDoc,
  GetAppsDoc,
} from './openapi/decorators';
import { EditAppDto } from './dtos/edit-app.dto';
import { ResetSecretDoc } from './openapi/decorators/reset-secret.decorator';

@ApiTags('Apps')
@UseGuards(JwtGuard)
@Controller('apps')
export class AppsController {
  constructor(private appsService: AppsService) {}

  @CreateAppDoc()
  @Throttle({ default: { ttl: 1000 * 60 * 60 * 12, limit: 10 } })
  @Post('')
  createApp(@Body() createAppDto: CreateAppDto, @Req() req: Request) {
    return this.appsService.createApp({
      ...createAppDto,
      userId: req.payload!.id,
    });
  }

  @GetAppsDoc()
  @Get('')
  getApps(@Req() req: Request) {
    return this.appsService.getApps(req.payload!.id);
  }

  @GetAppDoc()
  @Get(':id')
  getApp(@Param() params: { id: string }, @Req() req: Request) {
    return this.appsService.getApp(params.id, req.payload!.id);
  }

  @DeleteAppDoc()
  @Delete(':id')
  deleteApp(@Param() params: { id: string }, @Req() req: Request) {
    return this.appsService.deleteApp(params.id, req.payload!.id);
  }

  @EditAppDoc()
  @Patch(':id')
  editApp(
    @Param() params: { id: string },
    @Body() editAppDto: EditAppDto,
    @Req() req: Request,
  ) {
    return this.appsService.editApp(params.id, req.payload!.id, editAppDto);
  }

  @ResetSecretDoc()
  @HttpCode(200)
  @Post(':id/secret/reset')
  resetAppSecret(@Param() params: { id: string }, @Req() req: Request) {
    return this.appsService.resetAppSecret(params.id, req.payload!.id);
  }
}
