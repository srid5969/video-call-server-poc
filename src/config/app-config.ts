const appConfig = () => ({
  PORT: +(process.env.PORT || 3000),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/nest',
  DATABASE: process.env.DATABASE || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  STUN_SERVER: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
  TURN_SERVER: process.env.TURN_SERVER || 'turn:turn.bistri.com:80',
  TURN_USERNAME: process.env.TURN_USERNAME || 'homeo',
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL || 'homeo',
});
export interface AppConfig {
  PORT: number;
  MONGODB_URI: string;
  DATABASE: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
  APP_URL: string;
  STUN_SERVER: string;
  TURN_SERVER: string;
  TURN_USERNAME: string;
  TURN_CREDENTIAL: string;
}
export default appConfig;
