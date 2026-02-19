const apiKey = "c758a656febbc93a5cf685e00d078971";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const geoApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const searchBox = document.querySelector(".search input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const weatherCard = document.getElementById("weather-card");
const errorMsg = document.getElementById("error-msg");

async function checkWeather(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (response.status == 404) {
            showError();
        } else {
            const data = await response.json();
            updateUI(data);
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        showError("Something went wrong. Please check your connection.");
    }
}

async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${geoApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        } else {
            showError();
        }
    } catch (error) {
        console.error("Error fetching weather by coords:", error);
        showError();
    }
}

function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name + ", " + data.sys.country;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    document.querySelector(".description").innerHTML = data.weather[0].description;

    const condition = data.weather[0].main;
    const iconContainer = document.getElementById("w-icon-container");
    const body = document.body;

    // Reset theme
    body.className = "";

    const iconBaseUrl = "https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/";
    const icons = {
        sun: "clear-day.svg",
        cloud: "cloudy.svg",
        partlyCloudy: "partly-cloudy-day.svg",
        rain: "rain.svg",
        drizzle: "drizzle.svg",
        snow: "snow.svg",
        mist: "mist.svg",
        haze: "haze.svg",
        storm: "thunderstorms.svg",
        tornado: "tornado.svg"
    };

    let iconName = icons.cloud;

    if (condition === "Clear") {
        iconName = icons.sun;
        body.classList.add("theme-sunny");
    } else if (condition === "Clouds") {
        iconName = data.clouds.all > 50 ? icons.cloud : icons.partlyCloudy;
        body.classList.add("theme-cloudy");
    } else if (condition === "Rain") {
        iconName = icons.rain;
        body.classList.add("theme-rainy");
    } else if (condition === "Drizzle") {
        iconName = icons.drizzle;
        body.classList.add("theme-rainy");
    } else if (condition === "Snow") {
        iconName = icons.snow;
        body.classList.add("theme-snowy");
    } else if (condition === "Mist" || condition === "Smoke" || condition === "Haze" || condition === "Fog") {
        iconName = icons.haze;
        body.classList.add("theme-misty");
    } else if (condition === "Thunderstorm") {
        iconName = icons.storm;
        body.classList.add("theme-stormy");
    } else if (condition === "Tornado") {
        iconName = icons.tornado;
        body.classList.add("theme-stormy");
    }

    iconContainer.innerHTML = `<img src="${iconBaseUrl}${iconName}" alt="${condition}" style="width:100%; height:100%;">`;

    weatherCard.style.display = "flex";
    weatherCard.style.flexDirection = "column";
    weatherCard.style.alignItems = "center";
    errorMsg.style.display = "none";
}

function showError(msg = "Oops! City not found. Please try again.") {
    errorMsg.querySelector("p").innerText = msg;
    errorMsg.style.display = "block";
    weatherCard.style.display = "none";
}

searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value.trim() !== "") {
        checkWeather(searchBox.value);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                checkWeatherByCoords(latitude, longitude);
                locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use My Location';
            },
            (error) => {
                console.error("Geolocation error:", error);
                showError("Location access denied.");
                locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use My Location';
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});
