import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchEvent extends Document {
  query: string;
  ipHash: string;
  createdAt: Date;
}

const searchEventSchema = new Schema<ISearchEvent>(
  {
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    ipHash: {
      type: String,
      required: [true, 'IP hash is required'],
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

// For trending aggregation (group by query, sort by createdAt)
searchEventSchema.index({ query: 1, createdAt: -1 });

// For dedup check (same IP + query within a window)
searchEventSchema.index({ ipHash: 1, query: 1, createdAt: -1 });

// TTL: auto-delete documents after 30 days
searchEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const SearchEvent: Model<ISearchEvent> = mongoose.model<ISearchEvent>(
  'SearchEvent',
  searchEventSchema
);
