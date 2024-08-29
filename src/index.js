import "./output.css";
import "../styles/weather-icons.min.css";

const container = document.getElementById("container");

const convertDateToDayOfWeek = (dateString) => {
  const date = new Date(dateString);

  // Array of days of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the numeric day of the week and map it to the day name
  return daysOfWeek[date.getDay()];
};
const renderArrows = () => {
  const screenWidth = window.innerWidth;

  if (screenWidth >= 1024) { // Check if the screen width is 640px or larger
    return `
      <button id="leftArrow" class="absolute btn btn-outline left-0 xl:top-[45%] bg-gray-800 p-3 rounded-full text-white"><</button>
      <button id="rightArrow" class="btn btn-outline absolute right-0 xl:top-[45%] bg-gray-800 p-3 rounded-full text-white">></button>
    `;
  } else {
    return ''; // Return empty string to not render arrows on mobile
  }
};
const showData = (weatherData) => {
  container.innerHTML = "";
  const weatherIconMap = {
    Clear: "wi wi-day-sunny",
    "Partially cloudy": "wi wi-day-cloudy ",
    Cloudy: "wi wi-cloudy",
    Rain: "wi wi-rain",
    Thunderstorm: "wi wi-thunderstorm",
    Snow: "wi wi-snow",
    Fog: "wi wi-fog",
    Windy: "wi wi-strong-wind",
    Overcast: "wi wi-cloud",
  };

  const getWeatherIcon = (condition) => {
    return weatherIconMap[condition] || "wi wi-na"; // Default to 'not available' icon if condition is unknown
  };

  const location = weatherData.resolvedAddress;
  const conditions = weatherData.days[0].conditions;
  const temperature = weatherData.days[0].temp;
  const feelsLike = weatherData.days[0].feelslike;
  const chanceOfRain = weatherData.days[0].precipprob;
  const humidity = weatherData.days[0].humidity;
  const windSpeed = weatherData.days[0].windspeed;
  const tempMax = weatherData.days[0].tempmax;
  const tempMin = weatherData.days[0].tempmin;

  console.log(weatherData.days);

  // Calculate the remaining hours for the current day
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timezone = weatherData.timezone;
  const localTime = now.toLocaleTimeString("en-US", { timeZone: timezone });
  const localDate = now.toLocaleDateString("en-US", options);

  const dailyData = weatherData.days;
  let dailyForecastHTML = "";
  dailyForecastHTML = `<div id="forecastContent" class="grid xl:grid-flow-col xl:auto-cols-auto 2xl:gap-6 xl:gap-5 lg:gap-2 sm:gap-4 h-full mt-3 pb-5 relative sm:grid-flow-row  sm:w-full ">`;
  dailyData.forEach((day) => {
    // Combine the date and time to create a valid Date object
    const timeString = convertDateToDayOfWeek(day.datetime);

    const dayTemp = day.temp;
    const dayConditions = day.conditions.split(",")[0].trim();

    console.log(day.datetime);
    const hourConditionsIcon = getWeatherIcon(String(dayConditions));

    dailyForecastHTML += `
    <div class="flex bg-slate-950/60 border border-slate-950/60 xl:flex-col md:h-11/12 md:max-h-full rounded-xl xl:min-w-52 xl:max-w-28 lg:min-w-28 sm:max-h-20 h-full items-center justify-around sm:flex-row ">
      <div class="flex sm:flex-row xl:flex-col xl:items-center h-full justify-center sm:w-10/12">
        <div class="flex font-bold xl:text-3xl sm:w-3/5 sm:text-base xl:w-full items-center justify-center xl:mt-3 xl:h-1/5"><p>${timeString}</p></div>
          <i class="flex ${hourConditionsIcon} xl:text-7xl sm:text-xl "></i>
        <div class="flex font-bold xl:text-3xl sm:text-2xl xl:w-full xl:mt-6 items-center justify-center xl:h-2/5">${dayTemp}°F</div>
      </div>
    </div>
  `;
  });

  dailyForecastHTML += `</div>`;

  const currentHour = now.getHours();
  let hourlyForecast = [];

  // Extract the hourly forecast data for today and the next day
  const todayHourlyData = weatherData.days[0].hours;
  const tomorrowHourlyData = weatherData.days[1].hours;

  // Filter today's hourly data starting from the current hour
  const remainingHoursToday = todayHourlyData.filter((hour) => {
    const hourTime = parseInt(hour.datetime.split(":")[0], 10); // Extract the hour from "HH:MM" format
    return hourTime >= currentHour;
  });

  // Add remaining hours of today to the forecast
  hourlyForecast = hourlyForecast.concat(remainingHoursToday);
  if (hourlyForecast.length > 15) {
    hourlyForecast = hourlyForecast.slice(0, 15);
  }
  // If we need more hours to complete the 15-hour forecast, add hours from tomorrow
  if (hourlyForecast.length < 15) {
    const remainingHoursNeeded = 15 - hourlyForecast.length;
    hourlyForecast = hourlyForecast.concat(
      tomorrowHourlyData.slice(0, remainingHoursNeeded)
    );
  }

  // Build HTML for the hourly forecast
  let hourlyForecastHTML = `<div id="forecastContent" class="grid xl:grid-flow-col xl:auto-cols-auto 2xl:gap-6 xl:gap-5 lg:gap-2 sm:gap-4 h-full mt-3 pb-5 relative sm:grid-flow-row sm:w-full ">`;
  hourlyForecast.forEach((hour) => {
    const timeString = `${hour.datetime}`;
    const time = new Date(
      `${weatherData.days[0].datetime}T${timeString}`
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const hourTemp = hour.temp;
    const hourConditions = hour.conditions;
    const hourConditionsIcon = getWeatherIcon(String(hourConditions));

    hourlyForecastHTML += `
             <div class="flex bg-slate-950/60 border border-slate-950/60 xl:flex-col md:h-11/12 md:max-h-full rounded-xl xl:min-w-52 xl:max-w-28 lg:min-w-28 sm:max-h-20 h-full items-center justify-around sm:flex-row ">
        <div class="flex sm:flex-row xl:flex-col xl:items-center h-full justify-center sm:w-10/12">
          <div class="flex font-bold xl:text-3xl sm:w-3/5 sm:text-base xl:w-full items-center justify-center xl:mt-3 xl:h-1/5"><p>${time}</p></div>
          <div class="flex items-center xl:w-full sm:w-1/5 justify-center xl:h-2/5 xl:mt-14"><i class="${hourConditionsIcon} xl:text-7xl sm:text-xl "></i></div>
          <div class="flex font-bold xl:text-3xl sm:text-2xl xl:w-full xl:mt-6 items-center justify-center xl:h-2/5">${hourTemp}°F</div>
        </div>
      </div>
        `;
     
  });

  hourlyForecastHTML += `</div>`;
  const mainConditionsIcon = getWeatherIcon(
    String(weatherData.days[0].conditions)
  );
  // Display weather data in the container
  container.innerHTML = `
  <div class="flex flex-col items-center text-white w-full p-4 >
    <!-- Header -->
    <h1 class="text-5xl font-bold mb-4 text-center sm:text-xl sm:hidden">The Weatherinator</h1>
    
    <!-- City Input Field -->
    <div class="flex items-center space-x-4 mb-8 sm:mb-2">
      <input id="cityInput" type="text" placeholder="Enter city..." 
        class="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl  focus:outline-none focus:ring-2 focus:ring-blue-500">
      <button id="submitCity" class="px-4 py-2 text-black bg-slate-300 rounded-xl hover:bg-blue-600">Search</button>
    </div>
    
    <!-- Main Weather Information -->
    <div id="main-1" class="flex xl:flex-row xl:w-[61%] lg:flex-col lg:w-[61%] md:w-[70%] md:flex-col sm:flex-col text-white sm:w-full  p-2 ml-auto mr-auto lg:gap-6">
      <div id="box1" class="bg-slate-950/60 border-slate-950/60 rounded-xl flex flex-col lg:w-11/12 justify-center items-center xl:mr-auto xl:ml-0 lg:ml-auto lg:mr-auto text-center ">
        <h2 class="justify-center font-bold lg:p-3 sm:pb-0 ">${location}</h2>
        <p class="font-bold lg:text-xl sm:text-base">${localTime}</p>
        <p class="font-bold lg:text-xl sm:text-base">${localDate}</p>
        <div class="flex box-border pb-8 pt-8"> 
        <i class="${mainConditionsIcon} mt-6 xl:text-9xl lg:text-7xl sm:text-5xl sm:mt-1 h-full"></i>
        </div>
        <p class="lg:text-4xl font-bold ">${conditions}</p>
        <div class="lg:text-6xl font-bold pb-3 sm:text-3xl">${temperature}°F</div>
      </div>
      <div id="box2" class="flex justify-end h-full text-6xl bg-slate-950/60 border-slate-950/60 rounded-xl lg:ml-auto lg:mr-auto lg:w-11/12 lg:mt-0 sm:mt-3 ">
        <div id="statBox1" class=" lg:mt-auto lg:mb-auto w-1/2 sm:m-0 sm:box-border sm:p-3 ">
          <div class="flex flex-col w-full">
            <div id="chanceOfRain" class="flex">
            <div class="flex justify-center w-2/5">
              <i class="wi wi-sprinkle lg:text-4xl ml-5 mt-3 sm:text-2xl"></i>
              </div>
              <div class="flex flex-col w-3/5"><p class="text-base sm:text-sm">Preciptation:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${chanceOfRain}%</span></div>
            </div>
            <div id="feelsLike" class="flex lg:mt-12 sm:mt-3">
              <div class="flex justify-center w-2/5">
              <i class="wi wi-thermometer-exterior lg:text-4xl ml-5 mt-3 sm:text-2xl  "></i>
              </div>
              <div class="flex flex-col w-3/5"><p class="lg:text-base sm:text-sm">Feels like:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${feelsLike}°F</span></div>
            </div>
            <div id="tempHigh" class="flex lg:mt-12 sm:mt-3">
            <div class="flex justify-center w-2/5">
              <i class="wi wi-hot ml-5 lg:text-4xl  mt-3 sm:text-2xl"></i>
              </div>
              <div class="flex flex-col w-3/5"><p class="text-base sm:text-sm">High:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${tempMax}°F</span></div>
            </div>
          </div>
        </div>
   
        <div id="statBox2" class=" lg:mt-auto lg:mb-auto w-1/2 sm:m-0 sm:box-border sm:p-3 ">
          <div class="flex flex-col w-full">
            <div id="humidityStat" class="flex mr-12">

            <div class="flex justify-center w-2/5">
              <i class="wi wi-humidity lg:text-4xl  sm:ml-3 mt-3 sm:text-2xl"></i>
              </div>
              <div class="flex flex-col w-3/5"><p class="text-base sm:text-sm">Humidity:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${humidity}%</span></div>
            </div>

          </div>
          <div id="windSpeed" class="flex lg:mt-12 max-h-[72px] sm:mt-3 mr-12">

            <div class="flex justify-center w-2/5">
            <i class="wi wi-strong-wind lg:text-4xl  mt-3 sm:text-2xl"></i>
            </div>
            <div class="flex flex-col w-3/5"><p class="text-base sm:text-sm">Wind:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${windSpeed}</span></div>

          </div>
          <div id="tempMin" class="flex lg:mt-12 sm:mt-3  mr-12">
            <div class="flex justify-center w-2/5">
            <i class="wi wi-snowflake-cold lg:text-4xl  mt-3 sm:text-2xl"></i>
            </div>
            <div class="flex flex-col  w-3/5"><p class="text-base sm:text-sm">Low:</p><span class="2xl:text-5xl lg:text-3xl sm:text-xl">${tempMin}°F</span></div>
          </div>
        </div>
        </div>
      </div>
    </div>
    <div class=" sm:m-auto xl:w-[61%] pl-5">
    <button id="hourlyBtn" class="btn btn-outline text-white">Hourly</button>
        <button id="dailyBtn" class="btn btn-outline text-white">Daily</button>
      </div>
    <!-- Forecast Section -->
    <div class="flex flex-col grow text-white rounded-xl xl:w-2/3  sm:max-h-96 lg:w-[66%] sm:w-full p-3 pl-5 shadow-xl sm:shadow-none sm:mt-0 mb-4 ml-auto mr-auto">
  
      <div id="bottomContainer" class="relative h-full">
        ${renderArrows()}
        <div id="forecastContainer" class="overflow-auto flex h-full xl:w-11/12 lg:w-10/12 md:w-4/6 sm:w-full ml-auto mr-auto sm:overflow-y-auto xl:overflow-y-hidden">
          ${dailyForecastHTML}
        </div>
      </div>
    </div>
  </div>
`;

  // Add event listeners for switching between hourly and daily
  let scrollAmount = 0; // Global scrollAmount variable

  // Reset scroll position and scrollAmount when switching views
  const resetScroll = () => {
  const forecastContainer = document.getElementById('forecastContainer');
  
  // Scroll the container to the leftmost position
  forecastContainer.scrollTo({ left: 0, behavior: 'smooth' });

  // Reset the scroll amount to 0
  scrollAmount = 0;

  // Ensure that the left arrow is hidden initially and right arrow is shown
  document.getElementById('leftArrow').style.display = 'none';
  document.getElementById('rightArrow').style.display = 'block';
};

const addArrowListeners = () => {
  const forecastContainer = document.getElementById('forecastContainer');
  const leftArrow = document.getElementById('leftArrow');
  const rightArrow = document.getElementById('rightArrow');

  // Function to enable arrow functionality on larger screens
  const enableArrowListeners = () => {
    
    // Remove existing event listeners to avoid duplicates
    leftArrow.replaceWith(leftArrow.cloneNode(true));
    rightArrow.replaceWith(rightArrow.cloneNode(true));

    const newLeftArrow = document.getElementById('leftArrow');
    const newRightArrow = document.getElementById('rightArrow');

    let scrollAmount = 0;
    const containerWidth = forecastContainer.offsetWidth;
    const itemWidth = containerWidth + 20; 
    const maxScroll = containerWidth * 2; 

    newLeftArrow.style.display = 'none';

    newLeftArrow.addEventListener('click', () => {
      scrollAmount -= itemWidth;
      forecastContainer.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });

      if (scrollAmount <= 0) {
        newLeftArrow.style.display = 'none';
        newRightArrow.style.display = 'block';
      }

      if (scrollAmount < maxScroll) {
        newRightArrow.style.display = 'block';
      }
    });

    newRightArrow.addEventListener('click', () => {
      scrollAmount += itemWidth;

      forecastContainer.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });

      if (scrollAmount > 0) {
        newLeftArrow.style.display = 'block';
      }

      if (scrollAmount >= maxScroll) {
        newRightArrow.style.display = 'none';
      }
    });
  };

  // Function to disable arrow functionality on smaller screens
  const disableArrowListeners = () => {
    leftArrow.replaceWith(leftArrow.cloneNode(true));
    rightArrow.replaceWith(rightArrow.cloneNode(true));
  };

  // Media query to detect screen size changes
  const mediaQuery = window.matchMedia('(min-width: 1024px)'); // 640px is the breakpoint for 'sm' in Tailwind

  const handleScreenChange = (e) => {
    if (e.matches) {
      // Screen is larger than 640px
      enableArrowListeners();
    } else {
      // Screen is smaller than 640px
      disableArrowListeners();
    }
  };

  // Attach event listeners based on the current screen size
  handleScreenChange(mediaQuery);

 
  // Listen for screen size changes
  mediaQuery.addListener(handleScreenChange);
};

// Event listeners for switching between hourly and daily views
const addEventListeners = () => {
  document.getElementById('hourlyBtn').addEventListener('click', () => {
    document.getElementById('forecastContainer').innerHTML = `${hourlyForecastHTML}`;
    resetScroll(); // Reset scroll and scrollAmount when switching to hourly view
    addArrowListeners(); // Re-add arrow listeners after updating content
  });

  document.getElementById('dailyBtn').addEventListener('click', () => {
    document.getElementById('forecastContainer').innerHTML = `${dailyForecastHTML}`;
    resetScroll(); // Reset scroll and scrollAmount when switching to daily view
    addArrowListeners(); // Re-add arrow listeners after updating content
  });
  document.getElementById('submitCity').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
      fetchWeatherDataByCity(city);
    } else {
      alert("Please enter a city name.");
    }
  });
};

// Initial call to set up everything
addEventListeners();
resetScroll();
addArrowListeners();
document.getElementById('forecastContainer').innerHTML = `${dailyForecastHTML}`; // Default view
}

// Fetch weather data from Visual Crossing
const fetchData = async () => {
  // Check if data is in localStorage
  const cachedWeatherData = localStorage.getItem("weatherData");
  if (cachedWeatherData) {
    // Parse and use the cached data
    showData(JSON.parse(cachedWeatherData));
    console.log("I did not call the API");
  } else {
    try {
      const response = await fetch(
        "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/VirginiaBeach,US?unitGroup=us&key=UG9YWP87SGBMVEKCLRAY6PAF2"
      );
      const weatherData = await response.json();

      // Store the data in localStorage
      localStorage.setItem("weatherData", JSON.stringify(weatherData));

      // Use the data
      showData(weatherData);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      alert("Error fetching weather data. Please try again later.");
    }
  }
};
const fetchWeatherDataByCity = async (city) => {
  try {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&key=UG9YWP87SGBMVEKCLRAY6PAF2`);
    const weatherData = await response.json();
    showData(weatherData);
  } catch (err) {
    alert("Error fetching weather data. Please try again.");
  }
};
// Call the fetchData function when needed
fetchData();