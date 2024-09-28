// DOM elements for the weather dashboard
const apiKey = 'd23ccbde1eaa67caf0e488ff8f9a5e7f'; // OpenWeatherMap API key
const citySearchForm = document.getElementById('city-search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDetails = document.getElementById('current-weather-details');
const forecastDetails = document.getElementById('forecast-details');
const searchHistory = document.getElementById('search-history');

// Base URLs for API calls
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';
const iconBaseUrl = 'https://openweathermap.org/img/wn/';

// Fetch weather data based on city name
async function getWeatherByCity(city) {
    try {
        // Make an API call to get weather data
        const geoResponse = await fetch(`${apiBaseUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
        const geoData = await geoResponse.json();
         // Check if the city was found
        if (geoData.cod === 200) {
            const { coord } = geoData; // Extract coordinates from the response
            getForecastByCoordinates(coord.lat, coord.lon, geoData.name); // Extract coordinates from the response
        } else {
            alert('City not found'); // Alert user if city is not found
        }
    } catch (error) {
        console.error('Error fetching city data:', error); // Log any errors
    }
}

// Fetch 5-day weather forecast based on coordinates
async function getForecastByCoordinates(lat, lon, cityName) {
    try {
        // Make an API call to get the forecast
        const forecastResponse = await fetch(`${apiBaseUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();

        // Display current weather and forecast data
        displayCurrentWeather(forecastData.list[0], cityName);
        displayForecast(forecastData.list);
    } catch (error) {
        console.error('Error fetching weather forecast:', error); // Log any errors
    }
}

// Display current weather information
function displayCurrentWeather(weather, cityName) {
    const date = new Date(weather.dt * 1000).toLocaleDateString(); // Format the date
    const icon = `${iconBaseUrl}${weather.weather[0].icon}@2x.png`; // Get weather icon

    // Update current weather details in the DOM
    currentWeatherDetails.innerHTML = `
        <h3>${cityName} (${date})</h3>
        <img src="${icon}" alt="${weather.weather[0].description}">
        <p>Temperature: ${weather.main.temp}°C</p>
        <p>Humidity: ${weather.main.humidity}%</p>
        <p>Wind Speed: ${weather.wind.speed} m/s</p>
    `;
}

// Display 5-day weather forecast
function displayForecast(forecastList) {
    forecastDetails.innerHTML = ''; // Clear previous forecast details
    const filteredForecast = forecastList.filter((_, index) => index % 8 === 0); // Filter data for daily forecasts

    // Loop through each forecast item
    filteredForecast.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString(); // Format the date
        const icon = `${iconBaseUrl}${forecast.weather[0].icon}@2x.png`; // Get weather icon

        // Create forecast item element
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <h4>${date}</h4>
            <img src="${icon}" alt="${forecast.weather[0].description}">
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
        `;
        forecastDetails.appendChild(forecastItem); // Append forecast item to the forecast details section
    });
}

// Save search history to localStorage
function saveSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || []; // Get existing history or initialize an empty array
    if (!history.includes(city)) { // Check if the city is not already in history
        history.push(city); // Add city to history
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history)); // Save updated history to localStorage
        displaySearchHistory(); // Update the displayed search history
    }
}

// Display search history as buttons
function displaySearchHistory() {
    searchHistory.innerHTML = ''; // Clear previous search history
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || []; // Get history from localStorage

    // Loop through each city in history
    history.forEach(city => {
        const historyButton = document.createElement('button'); // Create a button for each city
        historyButton.textContent = city; // Set button text to city name
        historyButton.addEventListener('click', () => {
            getWeatherByCity(city); // Fetch weather for the clicked city
        });
        searchHistory.appendChild(historyButton); // Append button to search history
    });
}

// Event listener for city search form submission
citySearchForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission behavior
    const city = cityInput.value.trim(); // Get trimmed city input value
    if (city) { // Check if city is not empty
        getWeatherByCity(city); // Fetch weather for the entered city
        saveSearchHistory(city); // Save the searched city to history
        cityInput.value = ''; // Clear input field
    }
});

// Initialize search history on page load
displaySearchHistory(); // Call function to display search history