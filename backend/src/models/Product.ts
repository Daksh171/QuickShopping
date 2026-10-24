import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageKey: string;
  packageSize: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    imageKey: {
      type: String,
      required: [true, 'Image key is required'],
      trim: true,
    },
    packageSize: {
      type: String,
      required: [true, 'Package size is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product: Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  productSchema
);
