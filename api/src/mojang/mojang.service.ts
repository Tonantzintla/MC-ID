import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ky, { HTTPError } from 'ky';

@Injectable()
export class MojangService {
  async getUsernameFromMcid(uuid: string) {
    const mojangApiUrl = `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`;
    try {
      const response = await ky
        .get(mojangApiUrl, { timeout: 5000 })
        .json<MojangProfileResponse>();
      return response.name;
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.response.status == 404) {
          return null;
        }
        throw new InternalServerErrorException(
          'Failed to fetch MCID for username.',
        );
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while fetching MCID.',
        );
      }
    }
  }
  async getMcidFromUsername(username: string) {
    const mojangApiUrl = `https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`;
    try {
      const response = await ky
        .get(mojangApiUrl, { timeout: 5000 })
        .json<MojangProfileResponse>();
      return response.id;
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.response.status == 404) {
          return null;
        }
        throw new InternalServerErrorException(
          'Failed to fetch MCID for username.',
        );
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while fetching MCID.',
        );
      }
    }
  }
}
