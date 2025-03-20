import { Router } from 'express';
import { container } from '../dependencyInjection/di-settings.js';

const userController = container.cradle.userController;

export const createUserRouter = () => {
  const userRouter = Router();

  userRouter.put('/', userController.create);
  userRouter.post('/', userController.login);

  return userRouter;
};
