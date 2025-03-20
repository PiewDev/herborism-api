import { asClass } from 'awilix';
import { UserController } from '../userController.js';
import { UserRepository } from '../userRepository.js';
import { UserService } from '../userService.js';

export const registerUserDependency = (container) => {
  container.register({
    userController: asClass(UserController).scoped(),
    userService: asClass(UserService).scoped(),
    userRepository: asClass(UserRepository).scoped()
  });
};
