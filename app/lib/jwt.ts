import { SignJWT, jwtVerify, decodeJwt, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  id: string;
  name?: string;
  email?: string;
  role: 'judge' | 'admin';
}

export async function signToken(
  payload: Record<string, any>,
  expiresIn: string = '24h'
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return decodeJwt(token) as TokenPayload;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
}