import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Product } from '../../models/Product';
import { SearchEvent } from '../../models/SearchEvent';
import { fuzzyScore } from '../../utils/fuzzySearch';
import type { SuggestionsQuery, SearchEventBody } from './search.validation';

// In-memory cache for trending searches: 5-minute TTL
interface TrendingCache {
  data: { query: string; count: number }[];
  expiresAt: number;
}
let trendingCache: TrendingCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hash IP address for privacy while preserving deduplication ability.
 */
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 16);
}

/**
 * GET /api/search/suggestions?q=<query>&limit=6
 * Typo-tolerant autocomplete suggestions.
 */
export async function getSearchSuggestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, limit } = req.query as unknown as SuggestionsQuery;
    const query = q.trim();

    if (!query) {
      res.json({ success: true, data: { suggestions: [] } });
      return;
    }

    // 1. Try exact / regex match on name (case-insensitive)
    const exactRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const exactMatches = await Product.find({
      isActive: true,
      name: { $regex: exactRegex },
    })
      .populate('category', 'name slug')
      .select('_id name slug price originalPrice imageKey packageSize category')
      .limit(limit);

    // If we have enough exact matches, sort prefix matches first, then return
    if (exactMatches.length >= limit) {
      const sorted = exactMatches.sort((a, b) => {
        const aPrefix = a.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
        const bPrefix = b.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
        return aPrefix - bPrefix;
      });

      res.json({ success: true, data: { suggestions: sorted.slice(0, limit) } });
      return;
    }

    // 2. Fallback / supplementary fuzzy search:
    // Fetch active products to compute fuzzy similarity scores
    const allActive = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .select('_id name slug price originalPrice imageKey packageSize category');

    const exactIds = new Set(exactMatches.map((p) => p._id.toString()));

    const scored = allActive
      .filter((p) => !exactIds.has(p._id.toString()))
      .map((p) => ({
        product: p,
        score: fuzzyScore(query, p.name),
      }))
      .filter((item) => item.score >= 0.25)
      .sort((a, b) => b.score - a.score);

    // Exact matches take priority, then top fuzzy matches
    const combined = [
      ...exactMatches,
      ...scored.map((s) => s.product),
    ].slice(0, limit);

    res.json({ success: true, data: { suggestions: combined } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/search/events
 * Record an accepted user search query with IP-based deduplication.
 */
export async function recordSearchEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = req.body as SearchEventBody;
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      res.status(400).json({ success: false, message: 'Search query is required' });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ipHash = hashIp(ip);

    // Dedup: check if identical query recorded from this IP in the last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const existing = await SearchEvent.findOne({
      ipHash,
      query: normalized,
      createdAt: { $gte: sixtySecondsAgo },
    });

    if (!existing) {
      await SearchEvent.create({
        query: normalized,
        ipHash,
      });
      // Invalidate trending cache
      trendingCache = null;
    }

    res.status(201).json({ success: true, message: 'Search event recorded' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/search/trending
 * Return top trending search queries over the last 7 days.
 */
export async function getTrendingSearches(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = Date.now();
    if (trendingCache && trendingCache.expiresAt > now) {
      res.json({ success: true, data: { trending: trendingCache.data } });
      return;
    }

    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const trending = await SearchEvent.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, query: '$_id', count: 1 } },
    ]);

    // Update in-memory cache
    trendingCache = {
      data: trending,
      expiresAt: now + CACHE_TTL_MS,
    };

    res.json({ success: true, data: { trending } });
  } catch (error) {
    next(error);
  }
}

