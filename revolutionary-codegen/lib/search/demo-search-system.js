/**
 * Demo Search System
 * Demonstrates the new UUID and tag-based ranking functionality
 */

const SearchEngine = require('./search-engine');
const { generateId } = require('../utils/id-generator');

// Example project data with enhanced metadata
const exampleProject = {
  project: {
    id: generateId(),
    name: 'ExampleProject',
    description: 'Demonstration project for search system',
    searchTags: ['demo', 'example', 'project'],
    searchBoost: 2.0
  },
  classes: {
    businessLogic: [
      {
        id: generateId(),
        name: 'UserService',
        description: 'Service for managing user operations',
        searchTags: ['user', 'service', 'business'],
        searchBoost: 3.0
      },
      {
        id: generateId(),
        name: 'OrderProcessor',
        description: 'Processes customer orders',
        searchTags: ['order', 'processor', 'business'],
        searchBoost: 2.5
      }
    ],
    aggregates: [
      {
        id: generateId(),
        name: 'UserAggregate',
        description: 'Aggregate for user-related data',
        searchTags: ['user', 'aggregate', 'data'],
        searchBoost: 1.5
      }
    ],
    factories: [
      {
        id: generateId(),
        name: 'ServiceFactory',
        description: 'Factory for creating service instances',
        searchTags: ['factory', 'service', 'creation'],
        searchBoost: 2.0
      }
    ],
    dataClasses: [
      {
        id: generateId(),
        name: 'UserData',
        description: 'Data class for user information',
        searchTags: ['user', 'data', 'model'],
        searchBoost: 1.0
      }
    ]
  },
  plugins: {
    groups: [
      {
        id: generateId(),
        name: 'CorePlugins',
        description: 'Core plugin group',
        searchTags: ['core', 'plugin', 'essential'],
        searchBoost: 2.5
      }
    ]
  }
};

function demonstrateSearchSystem() {
  console.log('🚀 Demonstrating Enhanced Search System with UUID and Tag-based Ranking\n');
  
  const searchEngine = new SearchEngine();
  
  // Index: example project data
  console.log('\n📝 Indexing example project data...');
  searchEngine.indexObject(exampleProject.project, 'project');
  for (const [type, objects] of Object.entries(exampleProject.classes)) {
    console.log(`\n📦 Indexing ${type}:`);
    objects.forEach(obj => {
      searchEngine.indexObject(obj, type);
    });
  }
  
  // Index plugins
  exampleProject.plugins.groups.forEach(plugin => {
    searchEngine.indexObject(plugin, 'plugin');
  });
  
  console.log(`\n✅ Indexed ${searchEngine.getObjectCount()} total objects\n`);
  
  // Demonstrate different search scenarios
  demonstrateSearchScenarios(searchEngine);
  
  console.log('\n🎯 Search System Features Demonstrated:');
  console.log('• Universal UUID generation for all objects');
  console.log('• Tag-based search with automatic ranking boosts');
  console.log('• Fuzzy matching capabilities');
  console.log('• Type-based filtering');
  console.log('• Search history and statistics');
  console.log('• Popular tags identification');
  console.log('\n✅ Demo completed successfully!');
}

function demonstrateSearchScenarios(searchEngine) {
  const scenarios = [
    {
      name: 'Basic Text Search',
      query: 'user',
      description: 'Search for user-related items'
    },
    {
      name: 'Tag-based Search',
      query: 'service',
      description: 'Search for items tagged with "service"'
    },
    {
      name: 'Multiple Tag Search',
      query: ['business', 'factory'],
      description: 'Search for items tagged with both "business" and "factory"'
    },
    {
      name: 'Fuzzy Search',
      query: 'ordr',
      description: 'Fuzzy search for "order" (typo for "order")'
    },
    {
      name: 'Type Filtering',
      query: '',
      description: 'Get all business logic classes',
      options: { types: ['businessLogic'] }
    },
    {
      name: 'Boost Demonstration',
      query: 'user',
      description: 'Show how user-tagged items get boosted',
      options: { boostTags: true }
    },
    {
      name: 'Popular Tags',
      query: '',
      description: 'Show most popular tags',
      options: { limit: 3 }
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`\n🔍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`   Query: "${scenario.query}"`);
    console.log(`   Description: ${scenario.description}`);
    
    const results = searchEngine.search(scenario.query, scenario.options);
    console.log(`   Found ${results.length} results:`);
    
    results.forEach((result, resultIndex) => {
      const boostInfo = result.searchBoost > 1.0 ? ` (boost: ${result.searchBoost}x)` : '';
      console.log(`     ${resultIndex + 1}. ${result.name}${boostInfo} (score: ${result.score}) - ${result.matchType}`);
    });
    
    if (results.length === 0) {
      console.log('   No results found.');
    }
  });
}

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateSearchSystem();
}

module.exports = {
  demonstrateSearchSystem,
  exampleProject
};
