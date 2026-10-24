import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../../models/Cart';
import { Product } from '../../models/Product';
import { AppError } from '../../middleware/errorHandler';
import type { AddCartItemInput, UpdateCartItemInput } from './cart.validation';

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate(
      'items.product',
      'name price originalPrice imageKey packageSize stock isActive slug'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    // Calculate totals
    const items = cart.items
      .filter((item) => {
        const product = item.product as unknown as {
          isActive: boolean;
          stock: number;
        };
        return product && product.isActive;
      })
      .map((item) => {
        const product = item.product as unknown as {
          _id: mongoose.Types.ObjectId;
          name: string;
          price: number;
          originalPrice?: number;
          imageKey: string;
          packageSize: string;
          stock: number;
          slug: string;
        };
        return {
          _id: item._id,
          product,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      });

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    res.json({
      success: true,
      data: {
        cart: {
          _id: cart._id,
          items,
          total: Math.round(total * 100) / 100,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId, quantity } = req.body as AddCartItemInput;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError('Invalid product ID', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        throw new AppError(`Only ${product.stock} items available`, 400);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
      });
    }

    await cart.save();

    res.status(existingItem ? 200 : 201).json({
      success: true,
      message: 'Item added to cart',
      data: { itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0) },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { quantity } = req.body as UpdateCartItemInput;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.find((i) => i._id?.toString() === id);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError('Product no longer available', 400);
    }

    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: { itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0) },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex((i) => i._id?.toString() === id);
    if (itemIndex === -1) {
      throw new AppError('Cart item not found', 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0) },
    });
  } catch (error) {
    next(error);
  }
}
