/**
 * UUID Generator
 * Generates standard UUIDs for schema objects
 */

class UuidGenerator {
  constructor() {
    this.usedIds = new Set();
  }

  /**
   * Generates a standard UUID v4
   * @returns {string} Generated UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
   */
  generateUuid() {
    let uuid;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      uuid = this.uuidv4();
      attempts++;
    } while (this.usedIds.has(uuid) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique UUID after maximum attempts');
    }

    this.usedIds.add(uuid);
    return uuid;
  }

  /**
   * Generates multiple unique UUIDs
   * @param {number} count - Number of UUIDs to generate
   * @returns {Array<string>} Array of unique UUIDs
   */
  generateMultipleUuids(count) {
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(this.generateUuid());
    }
    return uuids;
  }

  /**
   * UUID v4 implementation
   * @returns {string} UUID v4 string
   */
  uuidv4() {
    // Check if crypto.getRandomValues is available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Generate random bytes
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      
      // Set version bits (4) and variant bits (8, 9, A, or B)
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      
      // Convert to hex string with hyphens
      const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
      ].join('-');
    } else {
      // Fallback for environments without crypto support
      return this.uuidv4Fallback();
    }
  }

  /**
   * Fallback method for environments without crypto.getRandomValues
   * @returns {string} UUID v4 string
   */
  uuidv4Fallback() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Checks if a UUID is already used
   * @param {string} uuid - UUID to check
   * @returns {boolean} True if UUID is already used
   */
  isUuidUsed(uuid) {
    return this.usedIds.has(uuid);
  }

  /**
   * Manually add a UUID to the used set
   * @param {string} uuid - UUID to add
   */
  addUsedUuid(uuid) {
    this.usedIds.add(uuid);
  }

  /**
   * Remove a UUID from the used set
   * @param {string} uuid - UUID to remove
   */
  removeUsedUuid(uuid) {
    this.usedIds.delete(uuid);
  }

  /**
   * Clear all used UUIDs
   */
  clearUsedUuids() {
    this.usedIds.clear();
  }

  /**
   * Get count of used UUIDs
   * @returns {number} Number of used UUIDs
   */
  getUsedUuidCount() {
    return this.usedIds.size;
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} True if valid UUID format
   */
  validateUuidFormat(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Singleton instance
const uuidGenerator = new UuidGenerator();

// Export for use in schemas and templates
module.exports = {
  UuidGenerator,
  generateId: () => {
    try {
      return uuidGenerator.generateUuid();
    } catch (error) {
      // Fallback for environments without crypto support
      return uuidGenerator.uuidv4Fallback();
    }
  },
  uuidGenerator
};
