// 2 tabs
const userWeatherTab = document.querySelector("[data-userWeather]");
const searchWeatherTab = document.querySelector("[data-searchWeather]");

// 4 different UI
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const weatherInfoContainer = document.querySelector(".weather-info-container");

//error ko handle karna hai
const notFound = document.querySelector(".errorContainer");
const errorBtn = document.querySelector("[data-errorButton]");
const errorText = document.querySelector("[data-errorText]");
const errorImage = document.querySelector("[data-errorImg]");

// initilize
let currentTab = userWeatherTab;
currentTab.classList.add("current-tab");

const API_KEY = "4bafee28b1c01faf918ab1ef698bed05";

// kuch bacha hai??
getFromSessionalStorage();

// tab switching
function tabSwitching(clickedTab) {
  // tab is switched
  if (currentTab != clickedTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");
  }

  //searchform me active class nhi hai matlab mera switch hoke searchform me aya hu, so active class add krdiyo
  if (!searchForm.classList.contains("active")) {
    // step1:grant access ko hatao
    grantAccessContainer.classList.remove("active");
    // step2:weather info ko bhi hatao
    weatherInfoContainer.classList.remove("active");
    // step3:searchform ko dikhao
    searchForm.classList.add("active");
  }

  // hum user ke weather wale tab me hai
  else {
    // step1:searchform ko hatao
    searchForm.classList.remove("active");

    // if coordinates mile to grant ko hatao aur weatherinfo ko dikhao
    // warna weather ko hatao aur grant ko dikho

    grantAccessContainer.classList.remove("active");
    weatherInfoContainer.classList.remove("active");

    getFromSessionalStorage();
  }
}

userWeatherTab.addEventListener("click", function () {
  tabSwitching(userWeatherTab);
});

searchWeatherTab.addEventListener("click", function () {
  tabSwitching(searchWeatherTab);
});

// get from sessional Storage
function getFromSessionalStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");

  // meko coordinates nhi mile
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    let coordinates = JSON.parse(localCoordinates);
    fetchWeatherInfo(coordinates);
  }
}

// fetch weather info
async function fetchWeatherInfo(coordinates) {
  let lat = coordinates.latitude;
  let lon = coordinates.longitude;

  // grant to hatao
  grantAccessContainer.classList.remove("active");
  
  // error ko hatao
  notFound.classList.remove('active');

  // loader ko start karo
  loadingScreen.classList.add("active");

  try {
    let content = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Check if response is not OK
    if (!content.ok) {
      throw new Error(`Error: ${content.statusText}`);
    }
    let output = await content.json();

    // output aa gya, so loader ko hatao aur infocontainer ko visible karao
    loadingScreen.classList.remove("active");

    //weather info ko visible kro
    weatherInfoContainer.classList.add("active");

    //render on ui
    renderWeatherInfo(output);
  } catch (err) {
    //handle error

    // loader ko hatao
    loadingScreen.classList.remove("active");

    //weather info ko haatao
    weatherInfoContainer.classList.remove("active");

    // error ko show kro
    notFound.classList.add("active");

    //error message dalo
    errorText.innerText = `Error: Can't Find Location`;

    //error btn ke upar listener
    errorBtn.addEventListener("click", fetchWeatherInfo);
  }
}

// UI per render kardiyo
function renderWeatherInfo(weatherInfo) {
  // fetch all elements whose need to update dynamically
  const cityName = document.querySelector("[data-cityName]");
  const countryFlag = document.querySelector("[data-countryFlag]");
  const weatherDesc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temprature = document.querySelector("[data-temprature]");
  const windSpeed = document.querySelector("[data-windSpeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  // fetch values from weatherInfo object and put it UI elements
  cityName.innerText = weatherInfo?.name;
  countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temprature.innerText = `${(weatherInfo?.main?.temp).toFixed(2)} °C`;
  windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// get user current location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser");
  }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;

  const userCoordinates = {
    latitude: lat,
    longitude: lon,
  };

  //session storage me save kara do
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

  // user ke location ke coordinates mil gye, so uss coordinates ke liye weatherInfo fetch kardiyo
  fetchWeatherInfo(userCoordinates);
}

let grantAccessBtn = document.querySelector("[data-grantAccessBtn]");

// add listener on grant access button
grantAccessBtn.addEventListener("click", function () {
  getUserLocation();
});

// -------------------------------------------------------------------------------
// search form part

const searchInput = document.querySelector("[data-searchInput]");

// prevent default behavior of submit and fetchWeather info on the basis of city
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let cityName = searchInput.value;

  if (cityName == "") {
    weatherInfoContainer.classList.remove("active");
    return;
  } else {
    fetchSearchWeatherInfo(cityName);
  }
  searchInput.value = "";
});

// fetch weather info on the basis of city
async function fetchSearchWeatherInfo(cityName) {
  // loader ko on krdiyo
  loadingScreen.classList.add("active");

  // grant access ko hatao
  grantAccessContainer.classList.remove("active");

  // weather info ko hatao
  weatherInfoContainer.classList.remove("active");

  // error ko hatao
  notFound.classList.remove('active');

  try {
    let content = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );

    if (!content.ok) {
      throw new Error(`Error: ${content.statusText}`);
    }
    
    let output = await content.json();

    // we got content, so loader ko off kardiyo
    loadingScreen.classList.remove("active");

    //weaather info container ko add karo
    weatherInfoContainer.classList.add("active");

    // UI pe result ko render kro
    renderWeatherInfo(output);
  } catch (err) {
    // console.log("error aa gya ", error);
    //handle error

    // loader ko hatao
    loadingScreen.classList.remove("active");

    // weather info ko hatao
    weatherInfoContainer.classList.remove("active");

    // error page ko visible kardo
    notFound.classList.add("active");

    //error message dalo
    errorText.innerText = `Error: Can't Find Location`;

    //retry now wale button ko inactive karna hai
    errorBtn.style.display = "none";
  }
}

// prevent default behavior of 'Enter' key
/*searchInput.addEventListener('keydown', function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
})*/
