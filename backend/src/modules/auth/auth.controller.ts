import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User';
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import type { SignupInput, LoginInput } from './auth.validation';

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body as SignupInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook will hash
    });

    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
