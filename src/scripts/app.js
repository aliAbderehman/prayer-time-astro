import { getPrayerTime } from "../scripts/prayerTime";

const template = document.getElementById("time-box");
const timeContainer = document.querySelector(".time-box-container");
const hijriDate = document.querySelector(".hijri-date");
const enDate = document.querySelector(".en-date");
const locationName = document.querySelector(".location-name");

async function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function init() {
  try {
    const position = await getLocation();

    const { latitude, longitude } = position.coords;

    const prayerData = await getPrayerTime(latitude, longitude);
    console.log(prayerData);

    updateUI(prayerData, { latitude, longitude });
  } catch (e) {
    console.error(e);
  }
}

function formatTime(time24) {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr);

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return {
    time: `${hour}:${minute}`,
    period,
  };
}

function updateUI(data, coords) {
  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const prayerTimes = {};

  prayerNames.forEach((name) => {
    const time = data.data.timings[name];
    renderPrayerTime(name, formatTime(time));
    prayerTimes[name] = time;
  });

  upcomingPrayerTimer(prayerTimes);

  updateDate(data.data.date.hijri, data.data.date.readable);
  renderLocationName(coords);
}

function renderPrayerTime(name, time) {
  const clone = template.content.cloneNode(true);

  clone.querySelector(".prayer-name").textContent = name;
  clone.querySelector(".prayer-time").textContent = time.time;
  clone.querySelector(".prayer-span").textContent = time.period;

  timeContainer.appendChild(clone);
}

// TODO: handle count down upcoming prayer

function upcomingPrayerTimer(prayerTime) {
  console.log(prayerTime);
}

function updateDate(hijri, date) {
  const formattedhijri = `${hijri.day} ${hijri.month.en}, ${hijri.year}`;
  hijriDate.textContent = formattedhijri;
  enDate.textContent = date;
}

async function renderLocationName(coords) {
  const location = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
  );

  const data = await location.json();
  const address = data.address;

  const place =
    address.city ||
    address.town ||
    address.village ||
    address.state ||
    "Unknown location";

  const country = address.country || "";

  console.log(data);
  locationName.textContent = `${place}, ${country}`;
}

init();
