import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { PluginKeyGuard } from './guards/key.guard';
import { getCodeDoc } from './openapi/decorators';
import { ApiTags } from '@nestjs/swagger';

@Controller('plugin')
export class PluginController {
  constructor(private pluginService: PluginService) {}

  @getCodeDoc()
  @UseGuards(PluginKeyGuard)
  @Get('code/:userId')
  getCode(@Param('userId') userId: string) {
    return this.pluginService.getCode(userId);
  }
}
