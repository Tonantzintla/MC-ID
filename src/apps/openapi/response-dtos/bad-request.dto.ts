export class BadRequestDto {
  message: string[];
  error = 'Bad Request';
  statusCode = 400;
}
