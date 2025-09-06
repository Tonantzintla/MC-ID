import { JWTPayload } from 'jose';

interface CustomJwtPayload extends JWTPayload {
  id: string;
}
