import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productNameSnapshot: string;
  imageKeySnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  idempotencyKey: string;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    productNameSnapshot: {
      type: String,
      required: true,
    },
    imageKeySnapshot: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    lineTotal: {
      type: Number,
      required: true,
      min: [0, 'Line total cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
    idempotencyKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.index({ orderNumber: 1 }, { unique: true });

export const Order: Model<IOrder> = mongoose.model<IOrder>(
  'Order',
  orderSchema
);
