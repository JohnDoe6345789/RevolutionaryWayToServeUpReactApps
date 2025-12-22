/**
 * Test Search Engine
 * Tests the enhanced search functionality with UUID and tag-based ranking
 */

const SearchEngine = require('./search-engine');
const { generateId } = require('../utils/id-generator');

// Test data
const testObjects = [
  {
    name: 'BusinessLogicGenerator',
    description: 'Generates business logic classes with initialize/execute pattern',
    searchTags: ['business', 'logic', 'generator'],
    searchBoost: 2.0,
    type: 'generator'
  },
  {
    name: 'PluginDiscovery',
    description: 'Discovers and manages plugins in the codegen system',
    searchTags: ['plugin', 'discovery', 'management'],
    searchBoost: 1.5,
    type: 'utility'
  },
  {
    name: 'MultiLanguageGenerator',
    description: 'Generates code for multiple programming languages',
    searchTags: ['multi-language', 'codegen', 'generation'],
    searchBoost: 3.0,
    type: 'generator'
  },
  {
    name: 'DataClassFactory',
    description: 'Factory for creating data classes',
    searchTags: ['factory', 'data', 'class'],
    searchBoost: 1.0,
    type: 'factory'
  },
  {
    name: 'APIGenerator',
    description: 'Generates API endpoints and documentation',
    searchTags: ['api', 'rest', 'documentation'],
    searchBoost: 2.5,
    type: 'generator'
  }
];

function runTests() {
  console.log('🔍 Testing Enhanced Search Engine with UUID and Tag-based Ranking\n');
  
  const searchEngine = new SearchEngine();
  
  // Index test objects
  console.log('\n📝 Indexing test objects...');
  testObjects.forEach(obj => {
    searchEngine.indexObject(obj, obj.type);
  });
  
  console.log(`✅ Indexed ${searchEngine.getObjectCount()} objects\n`);
  
  // Test 1: Basic text search
  console.log('\n🔍 Test 1: Basic text search for "generator"');
  const results1 = searchEngine.search('generator');
  console.log(`Found ${results1.length} results:`);
  results1.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name} (score: ${result.score}) - ${result.matchType}`);
  });
  
  // Test 2: Tag-based search
  console.log('\n🔍 Test 2: Tag-based search for "api"');
  const results2 = searchEngine.search('api', { boostTags: true });
  console.log(`Found ${results2.length} results:`);
  results2.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name} (score: ${result.score}) - ${result.matchType}`);
  });
  
  // Test 3: Tag search with boost
  console.log('\n🔍 Test 3: Tag search for ["business", "logic"]');
  const results3 = searchEngine.searchByTags(['business', 'logic']);
  console.log(`Found ${results3.length} results:`);
  results3.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name} (score: ${result.score}) - ${result.matchType}`);
  });
  
  // Test 4: Fuzzy search
  console.log('\n🔍 Test 4: Fuzzy search for "api"');
  const results4 = searchEngine.search('api', { fuzzy: true });
  console.log(`Found ${results4.length} results:`);
  results4.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name} (score: ${result.score}) - ${result.matchType}`);
  });
  
  // Test 5: Type filtering
  console.log('\n🔍 Test 5: Filter by generator type');
  const results5 = searchEngine.search('', { types: ['generator'] });
  console.log(`Found ${results5.length} generators:`);
  results5.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.name} (score: ${result.score}) - boost: ${result.searchBoost}`);
  });
  
  // Test 6: Popular tags
  console.log('\n🔍 Test 6: Get popular tags');
  const popularTags = searchEngine.getPopularTags(5);
  console.log('Top 5 popular tags:');
  popularTags.forEach((tag, index) => {
    console.log(`  ${index + 1}. ${tag.tag} (${tag.count} uses)`);
  });
  
  // Test 7: Search statistics
  console.log('\n🔍 Test 7: Search statistics');
  const stats = searchEngine.getSearchStats();
  console.log('Search Statistics:');
  console.log(`  Total objects: ${stats.totalObjects}`);
  console.log(`  Total tags: ${stats.totalTags}`);
  console.log(`  Total searches: ${stats.totalSearches}`);
  console.log(`  Average results per search: ${stats.averageResultsPerSearch.toFixed(2)}`);
  
  // Test 8: UUID generation
  console.log('\n🔍 Test 8: UUID generation');
  for (let i = 0; i < 3; i++) {
    const uuid = generateId();
    console.log(`  Generated UUID ${i + 1}: ${uuid}`);
  }
  
  console.log('\n✅ All tests completed successfully!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testObjects,
  SearchEngine
};
