import { jwtCreator } from '../jwt/jwtCreator.js';
import tryCatch from '../utils/tryCatch.js';
import dotenv from 'dotenv';

dotenv.config();

const tokenExpirationTimeSeconds = process.env.TOKEN_EXPIRATION_TIME_SECONDS;

export class UserController {
  constructor ({ userService }) {
    this.userService = userService;
    this.create = this.create.bind(this);
    this.login = this.login.bind(this);
  }

  create = tryCatch(async (req, res) => {
    const { userName, password, role } = req.body;
    const newUser = await this.userService.create(userName, password, role);
    return res.status(201).json(newUser);
  });

  login = tryCatch(async (req, res) => {
    const { userName, password } = req.body;
    const logUser = await this.userService.login(userName, password);
    const token = jwtCreator({ userName: logUser[0], role: logUser[0].role });
    res
      .cookie('acces_token', token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: tokenExpirationTimeSeconds * 1000
        }
      )
      .status(200)
      .json({ userName: logUser[0].userName, role: logUser[0].role });
  });
}
