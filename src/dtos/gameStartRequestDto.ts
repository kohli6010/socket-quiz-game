import { IsString } from 'class-validator';

export class GameStartRequestDto {
  @IsString()
  playerId: string;
}
