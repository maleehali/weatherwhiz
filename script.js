const apiKey = 'd23ccbde1eaa67caf0e488ff8f9a5e7f'; // Replace with your OpenWeatherMap API key
const citySearchForm = document.getElementById('city-search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDetails = document.getElementById('current-weather-details');
const forecastDetails = document.getElementById('forecast-details');
const searchHistory = document.getElementById('search-history');

const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';
const iconBaseUrl = 'https://openweathermap.org/img/wn/';

// Get weather data by city name
async function getWeatherByCity(city) {
    try {
        const geoResponse = await fetch(`${apiBaseUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
        const geoData = await geoResponse.json();
        if (geoData.cod === 200) {
            const { coord } = geoData;
            getForecastByCoordinates(coord.lat, coord.lon, geoData.name);
        } else {
            alert('City not found');
        }
    } catch (error) {
        console.error('Error fetching city data:', error);
    }
}

// Get 5-day weather forecast by coordinates
async function getForecastByCoordinates(lat, lon, cityName) {
    try {
        const forecastResponse = await fetch(`${apiBaseUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        displayCurrentWeather(forecastData.list[0], cityName);
        displayForecast(forecastData.list);
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
    }
}

// Display current weather
function displayCurrentWeather(weather, cityName) {
    const date = new Date(weather.dt * 1000).toLocaleDateString();
    const icon = `${iconBaseUrl}${weather.weather[0].icon}@2x.png`;

    currentWeatherDetails.innerHTML = `
        <h3>${cityName} (${date})</h3>
        <img src="${icon}" alt="${weather.weather[0].description}">
        <p>Temperature: ${weather.main.temp}°C</p>
        <p>Humidity: ${weather.main.humidity}%</p>
        <p>Wind Speed: ${weather.wind.speed} m/s</p>
    `;
}

// Display 5-day forecast
function displayForecast(forecastList) {
    forecastDetails.innerHTML = '';
    const filteredForecast = forecastList.filter((_, index) => index % 8 === 0);
    filteredForecast.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const icon = `${iconBaseUrl}${forecast.weather[0].icon}@2x.png`;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <h4>${date}</h4>
            <img src="${icon}" alt="${forecast.weather[0].description}">
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
        `;
        forecastDetails.appendChild(forecastItem);
    });
}

// Save search history to localStorage
function saveSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        displaySearchHistory();
    }
}

// Display search history
function displaySearchHistory() {
    searchHistory.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    history.forEach(city => {
        const historyButton = document.createElement('button');
        historyButton.textContent = city;
        historyButton.addEventListener('click', () => {
            getWeatherByCity(city);
        });
        searchHistory.appendChild(historyButton);
    });
}

// Event listener for city search form
citySearchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        saveSearchHistory(city);
        cityInput.value = '';
    }
});

// Initialize search history on load
displaySearchHistory();
