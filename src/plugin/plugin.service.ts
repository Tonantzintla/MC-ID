import { Injectable, NotFoundException } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';

@Injectable()
export class PluginService {
  constructor(private codesService: CodesService) {}

  async getCode(mcId: string) {
    const data = await this.codesService.getLatestCodeByMC(mcId);
    if (!data) throw new NotFoundException('No codes for the specified user.');
    return data;
  }
}
