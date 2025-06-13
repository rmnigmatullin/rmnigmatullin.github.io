// Streaming platform URLs
const streamingPlatforms = {
    'Netflix': 'https://www.netflix.com',
    'HBO Max': 'https://www.hbomax.com',
    'Amazon Prime Video': 'https://www.amazon.com/Prime-Video',
    'Disney+': 'https://www.disneyplus.com',
    'Hulu': 'https://www.hulu.com',
    'Apple TV': 'https://tv.apple.com',
    'Paramount+': 'https://www.paramountplus.com',
    'Peacock': 'https://www.peacocktv.com',
    'Google Play': 'https://play.google.com/store/movies',
    'Vudu': 'https://www.vudu.com',
    'YouTube': 'https://www.youtube.com/movies'
};

// Demo movie database
const movieDatabase = {
    'ghostbusters': {
        id: 'ghostbusters',
        title: 'Ghostbusters',
        year: 1984,
        logline: 'A team of eccentric parapsychologists start<br>a ghost-catching business in New York City, facing<br>a supernatural threat that could bring about the apocalypse.',
        poster: 'images/1.jpg',
        available: true,
        platforms: ['HBO Max', 'Amazon Prime Video', 'Apple TV', 'Google Play', 'Vudu']
    },
    'the sure thing': {
        id: 'the-sure-thing',
        title: 'The Sure Thing',
        year: 1985,
        logline: 'A college freshman embarks on a cross-country road trip with a classmate, navigating comedic mishaps and romantic tension while pursuing<br>a guaranteed hookup in California.',
        poster: 'images/2.jpg',
        available: false,
        platforms: []
    }
};

// Application state
let currentState = {
    searchTerm: '',
    selectedLocation: '',
    selectedMovie: null,
    formData: {}
};

// Autocomplete state
let highlightedIndex = -1;
let autocompleteResults = [];

// Platform icon mapping
function getPlatformIcon(platform) {
    const iconFiles = {
        'HBO Max': 'icons/hbo.png',
        'Amazon Prime Video': 'icons/amazon-prime-logo-512.webp',
        'Apple TV': 'icons/appletv.png',
        'Google Play': 'icons/google-play-store-logo-main-icon-1.png',
        'Vudu': 'icons/vudu.png'
    };
    
    if (iconFiles[platform]) {
        return `<img src="${iconFiles[platform]}" alt="${platform}" class="platform-icon-img">`;
    }
    return platform; // Fallback to text for platforms without icons
}

// Screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Search functionality
function searchMovies(query) {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    for (const [key, movie] of Object.entries(movieDatabase)) {
        if (movie.title.toLowerCase().includes(searchTerm)) {
            results.push(movie);
        }
    }
    
    return results;
}

// Display search results
function displaySearchResults(results, searchTerm) {
    const resultsHeader = document.getElementById('results-header');
    const resultsContent = document.getElementById('results-content');
    const noResults = document.getElementById('no-results');
    
    if (results.length > 0) {
        resultsHeader.innerHTML = `Found ${results.length} film(s) matching "${searchTerm}"`;
        resultsContent.innerHTML = '';
        noResults.classList.add('hidden');
        
        results.forEach(movie => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result';
            resultDiv.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" class="search-result-poster">
                <div class="search-result-info">
                    <div class="search-result-title">${movie.title}</div>
                    <div class="search-result-year">${movie.year}</div>
                </div>
            `;
            resultDiv.addEventListener('click', () => selectMovie(movie));
            resultsContent.appendChild(resultDiv);
        });
    } else {
        resultsHeader.innerHTML = `No films found matching "${searchTerm}"`;
        resultsContent.innerHTML = '';
        noResults.classList.remove('hidden');
    }
}

// Autocomplete functionality
function showAutocomplete(query) {
    const dropdown = document.getElementById('autocomplete-dropdown');
    
    if (!query || query.length < 1) {
        hideAutocomplete();
        return;
    }
    
    autocompleteResults = searchMovies(query);
    
    if (autocompleteResults.length > 0) {
        dropdown.innerHTML = '';
        autocompleteResults.forEach((movie, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" class="autocomplete-poster">
                <div class="autocomplete-info">
                    <div class="autocomplete-title">${movie.title}</div>
                    <div class="autocomplete-year">${movie.year}</div>
                </div>
            `;
            item.addEventListener('click', () => selectAutocompleteItem(movie));
            dropdown.appendChild(item);
        });
        dropdown.classList.add('show');
        highlightedIndex = -1;
    } else {
        hideAutocomplete();
    }
}

function hideAutocomplete() {
    const dropdown = document.getElementById('autocomplete-dropdown');
    dropdown.classList.remove('show');
    highlightedIndex = -1;
    autocompleteResults = [];
}

function selectAutocompleteItem(movie) {
    const filmTitleInput = document.getElementById('film-title');
    filmTitleInput.value = movie.title;
    hideAutocomplete();
}

function highlightAutocompleteItem(direction) {
    const dropdown = document.getElementById('autocomplete-dropdown');
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    if (items.length === 0) return;
    
    // Remove previous highlight
    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        items[highlightedIndex].classList.remove('highlighted');
    }
    
    // Update index
    if (direction === 'down') {
        highlightedIndex = highlightedIndex < items.length - 1 ? highlightedIndex + 1 : 0;
    } else if (direction === 'up') {
        highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : items.length - 1;
    }
    
    // Add new highlight
    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        items[highlightedIndex].classList.add('highlighted');
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
}

function selectHighlightedItem() {
    if (highlightedIndex >= 0 && highlightedIndex < autocompleteResults.length) {
        selectAutocompleteItem(autocompleteResults[highlightedIndex]);
        return true;
    }
    return false;
}

// Select a movie and navigate to appropriate result screen
function selectMovie(movie) {
    currentState.selectedMovie = movie;
    
    if (movie.available) {
        showResultAvailable(movie);
    } else {
        showResultUnavailable(movie);
    }
}

// Show available result screen
function showResultAvailable(movie) {
    const movieCard = document.getElementById('movie-card-available');
    const availabilityContent = document.getElementById('availability-content');
    const availabilityLoading = document.getElementById('availability-loading');
    
    // Hide loading elements
    availabilityLoading.style.display = 'none';
    availabilityContent.style.display = 'none';
    
    // Create platform links with icons
    const platformsHtml = movie.platforms.map(platform => 
        `<a href="${streamingPlatforms[platform] || '#'}" target="_blank" rel="noopener noreferrer" class="platform-icon" title="${platform}">${getPlatformIcon(platform)}</a>`
    ).join('');
    
    // Display movie card with availability info
    movieCard.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.year}</div>
            <div class="movie-logline">${movie.logline}</div>
                         <div class="available-text">
                 <p>Available for streaming<br>in ${currentState.selectedLocation}</p>
                 <div class="streaming-platforms">${platformsHtml}</div>
             </div>
        </div>
    `;
    
    showScreen('result-available');
}

// Show unavailable result screen
function showResultUnavailable(movie) {
    const movieCard = document.getElementById('movie-card-unavailable');
    const unavailableHeader = document.getElementById('unavailable-header');
    
    // Display movie card with unavailable text
    movieCard.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.year}</div>
            <div class="movie-logline">${movie.logline}</div>
            <div class="unavailable-text">
                <p>Not currently available<br>for streaming in ${currentState.selectedLocation}.<br>Want to watch it anyway?</p>
            </div>
        </div>
    `;
    
    // Clear the separate unavailable header since it's now in the card
    unavailableHeader.innerHTML = '';
    
    showScreen('result-unavailable');
}

// Create movie card HTML
function createMovieCard(movie) {
    return `
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.year}</div>
            <div class="movie-logline">${movie.logline}</div>
        </div>
    `;
}

// Show microscreening form
function showMicroscreeningForm() {
    const header = document.getElementById('microscreening-header');
    header.innerHTML = `Fill in your info to request<br>${currentState.selectedMovie.title}`;
    showScreen('microscreening-form');
}

// Handle microscreening form submission
function handleMicroscreeningSubmission(formData) {
    currentState.formData = formData;
    
    // Show confirmation
    const confirmationHeader = document.getElementById('confirmation-header');
    confirmationHeader.innerHTML = `Your request for ${currentState.selectedMovie.title}<br>has been received.`;
    
    // Display summary
    const summaryContent = document.getElementById('summary-content');
    const attendeesValue = formData.get('attendees');
    const locationTypeValue = formData.get('locationType');
    
    const dateObj = new Date(formData.get('screeningDate'));
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    summaryContent.innerHTML = `
        <p>Movie: ${currentState.selectedMovie.title} (${currentState.selectedMovie.year})</p>
        <p>Screening Date: ${formattedDate}</p>
        <p>Attendees: ${attendeesValue}</p>
        <p>Location Type: ${locationTypeValue}</p>
        <p>Email: ${formData.get('email')}</p>
    `;
    
    showScreen('confirmation');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Search form submission
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        currentState.searchTerm = formData.get('filmTitle');
        currentState.selectedLocation = formData.get('location');
        
        // Hide autocomplete
        hideAutocomplete();
        
        // Show search results screen immediately
        showScreen('search-results');
        
        // Display results immediately
        const results = searchMovies(currentState.searchTerm);
        displaySearchResults(results, currentState.searchTerm);
    });
    
    // Film title input autocomplete
    const filmTitleInput = document.getElementById('film-title');
    
    filmTitleInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        showAutocomplete(query);
    });
    
    filmTitleInput.addEventListener('keydown', function(e) {
        const dropdown = document.getElementById('autocomplete-dropdown');
        const isDropdownVisible = dropdown.classList.contains('show');
        
        if (isDropdownVisible) {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    highlightAutocompleteItem('down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    highlightAutocompleteItem('up');
                    break;
                case 'Enter':
                    if (selectHighlightedItem()) {
                        e.preventDefault();
                    }
                    break;
                case 'Escape':
                    hideAutocomplete();
                    break;
            }
        }
    });
    
    filmTitleInput.addEventListener('blur', function(e) {
        // Delay hiding to allow for click events on dropdown items
        setTimeout(() => {
            hideAutocomplete();
        }, 150);
    });
    
    // Prevent form submission when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.autocomplete-container')) {
            hideAutocomplete();
        }
    });
    
    // Back to search button
    document.getElementById('back-to-search').addEventListener('click', function() {
        showScreen('landing-page');
    });
    
    // Back to results buttons
    document.getElementById('back-to-results-available').addEventListener('click', function() {
        showScreen('search-results');
    });
    
    document.getElementById('back-to-results-unavailable').addEventListener('click', function() {
        showScreen('search-results');
    });
    
    // Request microscreening button
    document.getElementById('request-microscreening').addEventListener('click', function() {
        showMicroscreeningForm();
    });
    
    // Microscreening form submission
    document.getElementById('screening-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-request');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Submitting…';
        submitButton.disabled = true;
        
        // Simulate submission delay
        setTimeout(() => {
            const formData = new FormData(this);
            handleMicroscreeningSubmission(formData);
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
    
    // Cancel button
    document.getElementById('cancel-request').addEventListener('click', function() {
        showScreen('result-unavailable');
    });
    
    // Search another film button
    document.getElementById('search-another').addEventListener('click', function() {
        // Reset form
        document.getElementById('search-form').reset();
        document.getElementById('screening-form').reset();
        
        // Reset state
        currentState = {
            searchTerm: '',
            selectedLocation: '',
            selectedMovie: null,
            formData: {}
        };
        
        showScreen('landing-page');
    });
    
    // Download guidebook button
    document.getElementById('download-guidebook').addEventListener('click', function() {
        // Create a temporary link to download the PDF
        const link = document.createElement('a');
        link.href = 'WATCHING_TOGETHER.pdf';
        link.download = 'WATCHING_TOGETHER.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Set minimum date for screening date picker (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('screening-date').setAttribute('min', minDate);
});

// Initialize the app
showScreen('landing-page'); 