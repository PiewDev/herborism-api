import { FailedCreatingError } from '../errors/errorTypes/failedCreatingError.js';
import { InvalidDataError } from '../errors/errorTypes/invalidDataError.js';
import { userValidate } from './userValidator.js';
import { FAILED_CREATE, INVALID_DATA, INVALID_LOGIN, USERS } from '../utils/textConstants.js';
import bcrypt from 'bcrypt';

export class UserService {
  constructor ({ userRepository }) {
    this.userRepository = userRepository;
  }

  validateUser = (userName, password) => {
    const userValidated = userValidate(userName, password);
    if (!userValidated.success) {
      throw new InvalidDataError(INVALID_DATA, USERS);
    }
    return userValidated.data;
  };

  create = async (userName, password, role) => {
    const user = this.validateUser(userName, password);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const newUser = await this.userRepository.create({
      ...user,
      password: hashedPassword,
      role: role || 'commonUser' // Asignar rol al usuario
    });

    if (!newUser) {
      throw new FailedCreatingError(FAILED_CREATE, USERS);
    }

    return newUser;
  };

  login = async (userName, password) => {
    const user = this.validateUser(userName, password);
    const getUser = await this.userRepository.getBy({ userName: user.userName });
    if (!getUser[0] || !(await bcrypt.compare(password, getUser[0].passwordHash))) {
      throw new InvalidDataError(INVALID_LOGIN, USERS);
    }
    return getUser;
  };
};
