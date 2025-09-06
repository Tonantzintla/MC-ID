export class UnauthorizedDto {
  message: string;
  error = 'Unauthorized';
  statusCode = 401;
}
