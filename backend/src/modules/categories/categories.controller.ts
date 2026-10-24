import { Request, Response, NextFunction } from 'express';
import { Category } from '../../models/Category';
import { AppError } from '../../middleware/errorHandler';

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}
