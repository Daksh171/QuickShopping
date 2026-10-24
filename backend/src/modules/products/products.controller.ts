import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { AppError } from '../../middleware/errorHandler';
import type { ProductQuery } from './products.validation';

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, category, search, sort } = req.query as unknown as ProductQuery;

    const filter: Record<string, unknown> = { isActive: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      } else {
        // Return empty results for invalid category
        res.json({
          success: true,
          data: { products: [], pagination: { page, limit, total: 0, pages: 0 } },
        });
        return;
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      newest: { createdAt: -1 },
    };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid product ID', 400);
    }

    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}
