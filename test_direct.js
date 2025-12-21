// Test importing with relative path from project root
try {
  const LoggingService = require('./bootstrap/services/cdn/logging-service.js');
  console.log('Successfully imported LoggingService');
  console.log('Type of LoggingService:', typeof LoggingService);
} catch (error) {
  console.log('Error importing:', error.message);
}