/**
 * Enhanced Search Engine with Tag-based Ranking
 * Provides universal search across all object types with tag boosting
 */

const { generateId } = require('../utils/id-generator');

class SearchEngine {
  constructor() {
    this.objects = new Map();
    this.tagIndex = new Map();
    this.searchHistory = new Map();
  }

  /**
   * Add an object to the search index
   * @param {Object} obj - Object to index
   * @param {string} type - Object type (class, plugin, generator, etc.)
   */
  indexObject(obj, type) {
    // Ensure object has required metadata
    if (!obj.id) {
      obj.id = generateId();
    }
    if (!obj.searchTags) {
      obj.searchTags = [];
    }
    if (!obj.searchBoost) {
      obj.searchBoost = 1.0;
    }

    // Store object
    const objectId = obj.id;
    this.objects.set(objectId, {
      ...obj,
      type,
      indexedAt: new Date().toISOString()
    });

    // Build tag index
    obj.searchTags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag).add(objectId);
    });
  }

  /**
   * Search for objects across all indexed types
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} - Ranked search results
   */
  search(query, options = {}) {
    const {
      types = [],           // Filter by object types
      tags = [],            // Filter by tags
      boostTags = true,      // Enable tag boosting
      fuzzy = false,         // Enable fuzzy matching
      limit = 50            // Result limit
    } = options;

    if (!query || query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search through all indexed objects
    for (const [objectId, obj] of this.objects) {
      // Type filter
      if (types.length > 0 && !types.includes(obj.type)) {
        continue;
      }

      // Calculate relevance score
      let score = this.calculateRelevanceScore(obj, lowerQuery, fuzzy);
      
      // Tag filtering
      if (tags.length > 0) {
        const hasRequiredTag = tags.some(tag => 
          obj.searchTags.some(objTag => 
            objTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasRequiredTag) {
          continue;
        }
      }

      // Apply tag boost
      if (boostTags) {
        score += this.calculateTagBoost(obj, lowerQuery);
      }

      // Apply search boost multiplier
      score *= obj.searchBoost || 1.0;

      if (score > 0) {
        results.push({
          ...obj,
          score,
          matchType: this.getMatchType(obj, lowerQuery, fuzzy)
        });
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Apply limit
    const limitedResults = results.slice(0, limit);

    // Record search history
    this.recordSearch(query, options, limitedResults.length);

    return limitedResults;
  }

  /**
   * Calculate base relevance score for an object
   * @param {Object} obj - Object to score
   * @param {string} query - Search query
   * @param {boolean} fuzzy - Enable fuzzy matching
   * @returns {number} - Relevance score
   */
  calculateRelevanceScore(obj, query, fuzzy = false) {
    let score = 0;
    const name = (obj.name || '').toLowerCase();
    const description = (obj.description || '').toLowerCase();

    // Exact name match (highest score)
    if (name === query) {
      score += 100;
    }
    // Name contains query
    else if (name.includes(query)) {
      score += 50;
    }
    // Fuzzy name matching
    else if (fuzzy && this.fuzzyMatch(name, query)) {
      score += 25;
    }

    // Exact description match
    if (description === query) {
      score += 40;
    }
    // Description contains query
    else if (description.includes(query)) {
      score += 20;
    }
    // Fuzzy description matching
    else if (fuzzy && this.fuzzyMatch(description, query)) {
      score += 10;
    }

    return score;
  }

  /**
   * Calculate tag-based boost score
   * @param {Object} obj - Object to score
   * @param {string} query - Search query
   * @returns {number} - Tag boost score
   */
  calculateTagBoost(obj, query) {
    let boostScore = 0;
    
    for (const tag of obj.searchTags) {
      const lowerTag = tag.toLowerCase();
      
      // Exact tag match
      if (lowerTag === query) {
        boostScore += 50;
      }
      // Tag contains query
      else if (lowerTag.includes(query)) {
        boostScore += 25;
      }
      // Query contains tag
      else if (query.includes(lowerTag)) {
        boostScore += 15;
      }
    }

    return boostScore;
  }

  /**
   * Simple fuzzy matching using Levenshtein distance
   * @param {string} str - String to match
   * @param {string} query - Query string
   * @returns {boolean} - True if fuzzy match
   */
  fuzzyMatch(str, query) {
    if (str.length < query.length) return false;
    
    // Simple fuzzy matching - allow up to 2 character differences
    const maxDistance = Math.max(1, Math.floor(str.length * 0.3));
    return this.levenshteinDistance(str, query) <= maxDistance;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
      for (let j = 0; j <= str1.length; j++) {
        matrix[i][j] = i === 0 && j === 0 ? 0 : 
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1] && matrix[i - 1][j] ? matrix[i - 1][j] + 1 : Number.POSITIVE_INFINITY,
            matrix[i - 1] && matrix[i - 1][j - 1] ? matrix[i - 1][j - 1] + 1 : Number.POSITIVE_INFINITY
          );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Determine the type of match that occurred
   * @param {Object} obj - Object that matched
   * @param {string} query - Search query
   * @param {boolean} fuzzy - Whether fuzzy matching was used
   * @returns {string} - Match type
   */
  getMatchType(obj, query, fuzzy) {
    const name = (obj.name || '').toLowerCase();
    const description = (obj.description || '').toLowerCase();

    if (name === query) return 'exact-name';
    if (description === query) return 'exact-description';
    if (name.includes(query)) return 'partial-name';
    if (description.includes(query)) return 'partial-description';
    if (fuzzy) return 'fuzzy';
    return 'partial';
  }

  /**
   * Search for objects by specific tags
   * @param {Array} tags - Tags to search for
   * @param {Object} options - Search options
   * @returns {Array} - Objects with matching tags
   */
  searchByTags(tags, options = {}) {
    const { limit = 50 } = options;
    const results = [];
    const lowerTags = tags.map(tag => tag.toLowerCase());

    for (const tag of lowerTags) {
      if (this.tagIndex.has(tag)) {
        for (const objectId of this.tagIndex.get(tag)) {
          const obj = this.objects.get(objectId);
          if (obj && !results.find(r => r.id === objectId)) {
            results.push({
              ...obj,
              score: 100, // Tag match gets high score
              matchType: 'tag-match'
            });
          }
        }
      }
    }

    // Remove duplicates and sort
    const uniqueResults = results.filter((obj, index, self) => 
      results.findIndex(r => r.id === obj.id) === index
    );

    uniqueResults.sort((a, b) => {
      // Sort by search boost, then by name
      if (a.searchBoost !== b.searchBoost) {
        return b.searchBoost - a.searchBoost;
      }
      return a.name.localeCompare(b.name);
    });

    return uniqueResults.slice(0, limit);
  }

  /**
   * Get objects by type
   * @param {string} type - Object type to filter by
   * @param {Object} options - Options
   * @returns {Array} - Objects of specified type
   */
  getObjectsByType(type, options = {}) {
    const { limit = 50, sortBy = 'name' } = options;
    const results = [];

    for (const [objectId, obj] of this.objects) {
      if (obj.type === type) {
        results.push(obj);
      }
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'searchBoost':
          return (b.searchBoost || 1.0) - (a.searchBoost || 1.0);
        case 'indexedAt':
          return new Date(b.indexedAt) - new Date(a.indexedAt);
        default:
          return 0;
      }
    });

    return results.slice(0, limit);
  }

  /**
   * Get popular tags from indexed objects
   * @param {number} limit - Limit of tags to return
   * @returns {Array} - Popular tags with counts
   */
  getPopularTags(limit = 20) {
    const tagCounts = new Map();

    for (const [objectId, obj] of this.objects) {
      for (const tag of obj.searchTags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * Record search in history
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} resultCount - Number of results
   */
  recordSearch(query, options, resultCount) {
    const key = JSON.stringify({ query, options });
    const history = this.searchHistory.get(key) || {
      count: 0,
      lastSearched: null,
      totalResults: 0
    };

    history.count++;
    history.lastSearched = new Date().toISOString();
    history.totalResults += resultCount;

    this.searchHistory.set(key, history);
  }

  /**
   * Get search statistics
   * @returns {Object} - Search statistics
   */
  getSearchStats() {
    const totalObjects = this.objects.size;
    const totalTags = Array.from(this.tagIndex.keys()).length;
    const totalSearches = Array.from(this.searchHistory.values())
      .reduce((sum, history) => sum + history.count, 0);

    return {
      totalObjects,
      totalTags,
      totalSearches,
      averageResultsPerSearch: totalSearches > 0 ? 
        Array.from(this.searchHistory.values())
          .reduce((sum, history) => sum + history.totalResults, 0) / totalSearches : 0,
      popularTags: this.getPopularTags(10)
    };
  }

  /**
   * Clear all indexed objects
   */
  clearIndex() {
    this.objects.clear();
    this.tagIndex.clear();
    this.searchHistory.clear();
  }

  /**
   * Get indexed objects count
   * @returns {number} - Number of indexed objects
   */
  getObjectCount() {
    return this.objects.size;
  }
}

module.exports = SearchEngine;
