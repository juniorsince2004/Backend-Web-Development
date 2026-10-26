const bcrypt = require('bcryptjs');
const {
  DuplicateEmailError,
  createUser,
  findUserByEmail,
} = require('../db/userRepository');

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const INVALID_CREDENTIALS = {
  code: 'INVALID_CREDENTIALS',
  message: 'Invalid email or password',
};

function invalidInput() {
  return new AuthError(400, 'INVALID_INPUT', 'Required fields must be non-empty strings');
}

function validateFields(input, fields) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw invalidInput();
  }

  for (const field of fields) {
    if (
      typeof input[field] !== 'string' ||
      (field === 'password' ? input[field].length === 0 : input[field].trim().length === 0)
    ) {
      throw invalidInput();
    }
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function serializeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(input) {
  validateFields(input, ['name', 'email', 'password']);

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, Number(process.env.BCRYPT_COST || 12));

  try {
    return serializeUser(await createUser({ name, email, passwordHash }));
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login(input) {
  validateFields(input, ['email', 'password']);

  const user = await findUserByEmail(normalizeEmail(input.email));
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthError(401, INVALID_CREDENTIALS.code, INVALID_CREDENTIALS.message);
  }

  return serializeUser(user);
}

module.exports = { AuthError, login, register };
