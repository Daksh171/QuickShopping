import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import * as api from '../lib/api';
import type { SearchSuggestion, TrendingSearch } from '../types';

interface SmartSearchProps {
  onClose?: () => void;
  className?: string;
}

/**
 * Highlights matching query terms inside a target string using bold yellow styling.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className="px-0.5 rounded-none font-bold"
            style={{ backgroundColor: '#FDE047', color: '#171717' }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SmartSearch({ onClose, className = '' }: SmartSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch trending searches on first focus / mount
  const loadTrending = useCallback(async () => {
    try {
      const res = await api.getTrendingSearches();
      if (res.data?.trending) {
        setTrending(res.data.trending);
      }
    } catch {
      // Non-critical, fail silently for trending
    }
  }, []);

  // Fetch suggestions when debounced query changes (≥ 2 chars)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);
    setError(null);

    api
      .getSearchSuggestions(trimmed, 6)
      .then((res) => {
        if (!isSubscribed) return;
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
          setActiveIndex(-1);
        } else {
          setSuggestions([]);
        }
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error('Failed to fetch search suggestions:', err);
        setError('Could not load suggestions');
        setSuggestions([]);
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    api.recordSearchEvent(suggestion.name);
    setIsOpen(false);
    setQuery('');
    if (onClose) onClose();
    navigate(`/product/${suggestion.slug}`);
  };

  const handleSelectTrending = (trendingQuery: string) => {
    setQuery(trendingQuery);
    api.recordSearchEvent(trendingQuery);
    setIsOpen(false);
    if (onClose) onClose();
    navigate(`/products?search=${encodeURIComponent(trendingQuery)}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();

    // If an item in suggestions is highlighted by keyboard, navigate to it
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      handleSelectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (trimmed) {
      api.recordSearchEvent(trimmed);
      setIsOpen(false);
      setQuery('');
      if (onClose) onClose();
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showTrending = query.trim().length < 2 && trending.length > 0;
  const showSuggestions = query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            loadTrending();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for groceries, snacks, drinks..."
          className="input-brutal pl-10 pr-10 text-sm h-10 w-full"
          style={{ borderWidth: '2px', borderColor: '#171717' }}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          role="combobox"
        />

        {/* Clear or loading indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 size={16} className="animate-spin" style={{ color: '#171717' }} />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Clear search"
            >
              <X size={15} className="text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 bg-white z-50 overflow-hidden"
          style={{
            borderWidth: '3px',
            borderColor: '#171717',
            boxShadow: '4px 4px 0 #171717',
          }}
        >
          {/* Trending searches section */}
          {showTrending && (
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                <TrendingUp size={14} style={{ color: '#EF4444' }} />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => handleSelectTrending(item.query)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border-2 transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: '#171717',
                      backgroundColor: '#FAFAF5',
                      boxShadow: '2px 2px 0 #171717',
                    }}
                  >
                    <span>{item.query}</span>
                    <span
                      className="text-[10px] px-1 py-0.2 rounded font-black"
                      style={{ backgroundColor: '#FDE047', color: '#171717' }}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div>
              {loading && suggestions.length === 0 ? (
                <div className="p-4 text-center text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Searching fresh items...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm font-bold text-red-500">
                  {error}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm font-bold" style={{ color: '#171717' }}>
                    No products found for "{query}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Press <span className="font-bold underline">Enter</span> to view all catalog results
                  </p>
                </div>
              ) : (
                <ul className="divide-y-2 divide-gray-100 max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => {
                    const isSelected = activeIndex === index;
                    return (
                      <li
                        key={suggestion._id}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-yellow-200' : 'hover:bg-yellow-100'
                        }`}
                        style={{
                          backgroundColor: isSelected ? '#FDE047' : undefined,
                        }}
                      >
                        {/* Emoji icon fallback */}
                        <div
                          className="w-10 h-10 shrink-0 border-2 flex items-center justify-center text-xl bg-white"
                          style={{ borderColor: '#171717' }}
                        >
                          🛒
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-black truncate"
                            style={{ color: '#171717' }}
                          >
                            {highlightMatch(suggestion.name, query)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-0.5">
                            {suggestion.category && (
                              <span className="truncate">{suggestion.category.name}</span>
                            )}
                            {suggestion.packageSize && (
                              <>
                                <span>•</span>
                                <span>{suggestion.packageSize}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Price badge */}
                        <div className="shrink-0 text-right">
                          <span
                            className="text-sm font-black"
                            style={{ color: '#171717' }}
                          >
                            ₹{suggestion.price}
                          </span>
                          {suggestion.originalPrice && (
                            <span className="block text-[10px] line-through text-gray-400">
                              ₹{suggestion.originalPrice}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Footer hint */}
              <div
                className="px-3 py-2 text-[11px] font-bold text-gray-500 border-t-2 flex justify-between items-center bg-gray-50"
                style={{ borderTopColor: '#171717' }}
              >
                <span>
                  Tip: Use <kbd className="px-1 border bg-white rounded font-mono">↑</kbd>{' '}
                  <kbd className="px-1 border bg-white rounded font-mono">↓</kbd> to navigate,{' '}
                  <kbd className="px-1 border bg-white rounded font-mono">Enter</kbd> to select
                </span>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="font-bold underline text-xs"
                  style={{ color: '#171717' }}
                >
                  See all results →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

