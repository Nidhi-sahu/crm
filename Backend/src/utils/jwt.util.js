const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const jwtConfig = require('../config/jwt.config');

const baseOptions = {
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
};

const signAccess = (payload) =>
  jwt.sign(payload, jwtConfig.access.secret, {
    ...baseOptions,
    expiresIn: jwtConfig.access.expiresIn,
  });

const signRefresh = (payload, jti) =>
  jwt.sign(payload, jwtConfig.refresh.secret, {
    ...baseOptions,
    expiresIn: jwtConfig.refresh.expiresIn,
    jwtid: jti,
  });

const verifyAccess = (token) => jwt.verify(token, jwtConfig.access.secret, baseOptions);
const verifyRefresh = (token) => jwt.verify(token, jwtConfig.refresh.secret, baseOptions);

const newJti = () => randomUUID();

const parseExpiry = (str) => {
  const match = /^(\d+)([smhd])$/.exec(String(str).trim());
  if (!match) throw new Error(`Invalid expiry format: ${str}`);
  const n = Number(match[1]);
  const unit = match[2];
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
};

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, newJti, parseExpiry };
