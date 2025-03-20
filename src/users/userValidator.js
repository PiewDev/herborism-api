import z from 'zod';
import { PASSWORD_CONTAIN_SPACE, PASSWORD_REQUIRED, USERNAME_CONTAIN_SPACE, USERNAME_REQUIRED } from '../utils/textConstants.js';

const userSchema = z.object({
  userName: z.string()
    .min(1, { message: USERNAME_REQUIRED })
    .refine(value => !value.includes(' '), { message: USERNAME_CONTAIN_SPACE }),
  password: z.string()
    .min(1, { message: PASSWORD_REQUIRED })
    .refine(value => !value.includes(' '), { message: PASSWORD_CONTAIN_SPACE })
});

export const userValidate = (userName, password) => {
  const input = { userName, password };
  const result = userSchema.safeParse(input);
  return result;
};
