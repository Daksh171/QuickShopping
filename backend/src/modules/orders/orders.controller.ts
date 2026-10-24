import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../../models/Cart';
import { Product } from '../../models/Product';
import { Order, OrderStatus, type IOrderItem } from '../../models/Order';
import { AppError } from '../../middleware/errorHandler';
import type { CreateOrderInput } from './orders.validation';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QB-${timestamp}-${random}`;
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { idempotencyKey } = req.body as CreateOrderInput;

    // Check for duplicate submission
    const existingOrder = await Order.findOne({
      user: userId,
      idempotencyKey,
    });
    if (existingOrder) {
      res.status(200).json({
        success: true,
        message: 'Order already placed',
        data: { order: existingOrder },
      });
      return;
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Build order items with server-side prices
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);
      if (!product || !product.isActive) {
        throw new AppError(
          `Product "${(cartItem.product as unknown as { name: string })?.name || cartItem.product}" is no longer available`,
          400
        );
      }
      if (product.stock < cartItem.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          400
        );
      }

      const lineTotal = Math.round(product.price * cartItem.quantity * 100) / 100;
      totalAmount += lineTotal;

      orderItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        imageKeySnapshot: product.imageKey,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        lineTotal,
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Use transaction if available (Atlas replica set)
    const session = await mongoose.startSession();
    try {
      let order: InstanceType<typeof Order> | null = null;

      await session.withTransaction(async () => {
        // Decrement stock
        for (const item of orderItems) {
          const result = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { session, new: true }
          );
          if (!result) {
            throw new AppError(
              `Insufficient stock for "${item.productNameSnapshot}"`,
              400
            );
          }
        }

        // Create order
        const orders = await Order.create(
          [
            {
              orderNumber: generateOrderNumber(),
              user: userId,
              items: orderItems,
              totalAmount,
              status: OrderStatus.PLACED,
              idempotencyKey,
            },
          ],
          { session }
        );
        order = orders[0];

        // Clear cart
        await Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } },
          { session }
        );
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order },
      });
    } catch (txError) {
      // If transactions aren't supported (standalone), fall back to non-transactional
      if (
        txError instanceof Error &&
        txError.message.includes('Transaction')
      ) {
        console.warn(
          'Transactions not supported, falling back to non-transactional checkout'
        );

        // Decrement stock
        for (const item of orderItems) {
          const result = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
          if (!result) {
            throw new AppError(
              `Insufficient stock for "${item.productNameSnapshot}"`,
              400
            );
          }
        }

        const order = await Order.create({
          orderNumber: generateOrderNumber(),
          user: userId,
          items: orderItems,
          totalAmount,
          status: OrderStatus.PLACED,
          idempotencyKey,
        });

        // Clear cart
        await Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } }
        );

        res.status(201).json({
          success: true,
          message: 'Order placed successfully',
          data: { order },
        });
      } else {
        throw txError;
      }
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid order ID', 400);
    }

    const order = await Order.findOne({ _id: id, user: req.userId });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}
