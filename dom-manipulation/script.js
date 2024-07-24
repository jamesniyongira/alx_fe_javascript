// Initial quotes array
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", category: "Motivation" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", category: "Wisdom" }
];

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><p><em>${randomQuote.category}</em></p>`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      saveQuotes();
      populateCategoryFilter();
      filterQuotes();
      alert('Quote added successfully!');
      postQuoteToServer({ text: newQuoteText, category: newQuoteCategory }); // Post new quote to server
  } else {
      alert('Please enter both a quote and a category.');
  }
}

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
  }
  populateCategoryFilter();
  filterQuotes();
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
      try {
          const importedQuotes = JSON.parse(event.target.result);
          if (Array.isArray(importedQuotes)) {
              quotes.push(...importedQuotes);
              saveQuotes();
              populateCategoryFilter();
              filterQuotes();
              alert('Quotes imported successfully!');
          } else {
              alert('Invalid JSON format.');
          }
      } catch (error) {
          alert('Error importing quotes: ' + error.message);
      }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to populate the category filter dropdown
function populateCategoryFilter() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';
  filteredQuotes.forEach(quote => {
      const quoteElement = document.createElement('div');
      quoteElement.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
      quoteDisplay.appendChild(quoteElement);
  });
  localStorage.setItem('selectedCategory', selectedCategory); // Save selected category
}

// Function to load the last viewed quote from session storage
function loadLastViewedQuote() {
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
      const quote = JSON.parse(lastViewedQuote);
      const quoteDisplay = document.getElementById('quoteDisplay');
      quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
  }
}

// Function to restore the last selected category from local storage
function restoreLastSelectedCategory() {
  const lastSelectedCategory = localStorage.getItem('selectedCategory');
  if (lastSelectedCategory) {
      document.getElementById('categoryFilter').value = lastSelectedCategory;
  }
}

// Function to fetch quotes from a server using a mock API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Replace with actual API URL
    const data = await response.json();
    quotes = data.map(item => ({ text: item.title, category: item.body.substring(0, 10) })); // Adapt mapping as necessary
    saveQuotes();
    populateCategoryFilter();
    filterQuotes();
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
  }
}

// Function to post a new quote to a server using a mock API
async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', { // Replace with actual API URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
  } catch (error) {
    console.error('Error posting quote to server:', error);
  }
}

// Function to sync quotes with the server and handle conflicts
async function syncQuotes() {
  try {
    await fetchQuotesFromServer(); // Fetch new data from the server
    // Implement conflict resolution logic here (e.g., compare timestamps)
    // Example conflict resolution (simple version):
    const serverQuotes = quotes; // This should come from the server response
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Simple conflict resolution: Server data overwrites local data
    if (serverQuotes.length > 0) {
      localStorage.setItem('quotes', JSON.stringify(serverQuotes));
      quotes = serverQuotes;
      populateCategoryFilter();
      filterQuotes();
    }
  } catch (error) {
    console.error('Error syncing quotes:', error);
  }
}

// Periodically sync quotes with the server
setInterval(syncQuotes, 60000); // Sync every minute

// Load quotes, setup category filter, restore last selected category, and display last viewed quote when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  restoreLastSelectedCategory();
  loadLastViewedQuote();
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
});
