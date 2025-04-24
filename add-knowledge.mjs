// Script to add knowledge base data using ESM syntax
import fetch from 'node-fetch';
import fs from 'fs';

// Read the library data
const libraryData = JSON.parse(fs.readFileSync('./library-data.json', 'utf8'));

// Function to add knowledge data in batches
async function addKnowledgeBatch(data) {
  try {
    const response = await fetch('http://localhost:5000/api/knowledge/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log(`Added batch: ${result.added} items, success: ${result.success}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('Error adding knowledge batch:', error.message);
    return null;
  }
}

// Main function to process all data
async function processAllData() {
  console.log(`Starting to add ${libraryData.length} knowledge items...`);
  
  // Process in batches of 3 to avoid overwhelming the server
  const batchSize = 3;
  for (let i = 0; i < libraryData.length; i += batchSize) {
    const batch = libraryData.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(libraryData.length/batchSize)}`);
    await addKnowledgeBatch(batch);
    
    // Add a delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Finished adding all knowledge items');
}

// Run the process
processAllData().catch(console.error);