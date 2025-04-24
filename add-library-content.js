// Script to add library content to knowledge base
const fetch = require('node-fetch');

// Library content to add
const libraryContent = [
  {
    category: "library",
    title: "Jayakar Library (Central Library)",
    content: "The Jayakar Library, named after the university's first vice-chancellor, Dr. M.R. Jayakar, serves as the central library of SPPU. It offers a vast collection of resources, including: Books and E-books, Audio-visual academic content, Rare manuscripts, specimen copies, maps, microfilms, video cassettes, and CDs, Study materials for competitive exams. The library is computerized and has a seating capacity of 400 students. It also maintains a blog to keep students updated on library events and resources.",
    tags: ["library", "jayakar", "central library", "resources", "books"]
  },
  {
    category: "library",
    title: "Departmental Libraries",
    content: "In addition to the central library, various departments have their own specialized libraries. School of Education Library: Houses over 10,226 book titles and subscribes to more than 10 national and international journals. It has a seating capacity for 60 users. Department of Technology Library: Equipped with computers, internet connectivity, and photocopying services. It holds approximately 2,000 textbooks and reference books in engineering, life sciences, and clinical research, along with national and international journals. Department of Geography Library: Contains over 400 textbooks, encyclopedias, atlases, and reference books in geography and geoinformatics.",
    tags: ["departmental libraries", "education library", "technology library", "geography library"]
  },
  {
    category: "library",
    title: "Library Services and Facilities",
    content: "SPPU libraries offer a range of services to facilitate learning and research: Computerized Issue-Return: Streamlined borrowing and returning process. Periodical Service: Access to various magazines and journals. E-Journals and E-Book Service: Availability of electronic resources through platforms like INFLIBNET N-LIST. Open Access: Free access to research materials and scholarly resources. Online Public Access Catalogue (OPAC): Searchable database for library collections. Reference Service: Assistance in locating and using library resources. Current Awareness Service: Updates on new acquisitions and relevant information. Bibliographic Service: Provision of bibliographies on specific topics. Newspaper Clipping Service: Compilation of important news articles. User Orientation: Programs to familiarize users with library services. Access to Previous Question Papers and Syllabi: Resources for exam preparation.",
    tags: ["library services", "opac", "e-journals", "reference service"]
  },
  {
    category: "library",
    title: "Preservation of Ancient Manuscripts",
    content: "SPPU has initiated a project to digitize and catalog ancient manuscripts housed in the Department of Sanskrit and Prakrit Languages. In collaboration with the Dharohar Institute, the university aims to make these manuscripts accessible to scholars and researchers through computerized descriptive cataloging.",
    tags: ["manuscripts", "digitization", "sanskrit", "preservation"]
  },
  {
    category: "library",
    title: "Library Initiatives",
    content: "To promote reading habits and effective utilization of library resources, SPPU libraries have introduced initiatives like the Best Library User Award, recognizing students who make optimal use of library facilities.",
    tags: ["initiatives", "awards", "reading"]
  }
];

// Function to add a single item
async function addKnowledgeBaseItem(item) {
  try {
    const response = await fetch('http://localhost:5000/api/knowledge/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([item]),
    });
    
    const result = await response.json();
    console.log(`Added "${item.title}": ${result.added} items added, success: ${result.success}`);
    return result;
  } catch (error) {
    console.error(`Error adding "${item.title}":`, error.message);
    return null;
  }
}

// Add all items sequentially
async function addAllContent() {
  console.log('Starting to add library content to knowledge base...');
  
  for (const item of libraryContent) {
    await addKnowledgeBaseItem(item);
    // Add a slight delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Finished adding library content to knowledge base.');
}

// Run the function
addAllContent().catch(console.error);