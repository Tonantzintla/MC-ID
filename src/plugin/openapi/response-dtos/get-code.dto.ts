export class GetCodeNotFoundDto {
  message = 'No codes for the specified user.';
  error = 'Not Found';
  statusCode = 404;
}
export class GetCodeUnauthorizedDto {
  message: string;
  error = 'Unauthorized';
  statusCode = 401;
}
export class GetCodeSuccessDto {
  code: string;
  appName: string;
}
