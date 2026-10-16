const API_KEY = '9e74d95bcd18a49713fc4e7661ded9fe';
const UNITS   = 'metric';   

const BASE = 'https://api.openweathermap.org';

 
function owmInfo(id, iconStr) {
  const isDay = !String(iconStr).endsWith('n');
  const g = Math.floor(id / 100);

  if (id === 800) return { label: 'Clear sky',        icon: isDay ? '☀️' : '🌙', theme: 'clear' };
  if (id === 801) return { label: 'Few clouds',       icon: isDay ? '🌤️' : '☁️', theme: 'clouds' };
  if (id === 802) return { label: 'Scattered clouds', icon: '⛅',                theme: 'clouds' };
  if (id === 803) return { label: 'Broken clouds',    icon: '☁️',                theme: 'clouds' };
  if (id === 804) return { label: 'Overcast',         icon: '☁️',                theme: 'clouds' };

  if (g === 2) return { label: 'Thunderstorm', icon: '⛈️', theme: 'storm' };
  if (g === 3) return { label: 'Drizzle',      icon: '🌦️', theme: 'rain'  };
  if (g === 5) return { label: id >= 502 ? 'Rain' : 'Light rain', icon: '🌧️', theme: 'rain' };
  if (g === 6) return { label: 'Snow',         icon: '❄️', theme: 'snow'  };
  if (g === 7) return { label: 'Fog',          icon: '🌫️', theme: 'fog'   };

  return { label: 'Unknown', icon: '❓', theme: 'clouds' };
}

 
const form   = document.getElementById('search-form');
const input  = document.getElementById('city-input');
const output = document.getElementById('output');
const geoBtn = document.getElementById('geo-btn');

const esc = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function showLoading(msg) {
  output.innerHTML =
    `<div class="state"><div class="spinner"></div><p>${esc(msg)}</p></div>`;
}
function showError(msg) {
  output.innerHTML = `<div class="state error"><p>⚠️ ${esc(msg)}</p></div>`;
}

/** Turn "invalid key" / "401" style API errors into something readable. */
function apiError(res) {
  if (res.status === 401) return new Error('Invalid API key. Check the API_KEY value in the script.');
  if (res.status === 429) return new Error('Rate limit reached. Wait a moment and try again.');
  if (res.status === 404) return new Error('City not found.');
  return new Error(`Weather service error (HTTP ${res.status}).`);
}

 
function fmtOffset(sec) {
  const sign = sec >= 0 ? '+' : '-';
  const a = Math.abs(sec);
  const h = String(Math.floor(a / 3600)).padStart(2, '0');
  const m = String(Math.floor((a % 3600) / 60)).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

 
async function searchByCity(city) {
  showLoading(`Searching for “${city}”…`);

  const url = `${BASE}/geo/1.0/direct`
    + `?q=${encodeURIComponent(city)}&limit=1&appid=${encodeURIComponent(API_KEY)}`;

  const res = await fetch(url);
  if (!res.ok) throw apiError(res);

  const list = await res.json();
  if (!list.length) throw new Error(`No city found matching “${city}”.`);

  const p = list[0];
  const label = [p.name, p.state && p.state !== p.name ? p.state : null, p.country]
    .filter(Boolean).join(', ');

  await loadWeather(p.lat, p.lon, label);
}

 
async function loadWeather(lat, lon, label) {
  showLoading('Fetching weather…');

  const q = `lat=${lat}&lon=${lon}&units=${UNITS}&appid=${encodeURIComponent(API_KEY)}`;

  const [curRes, fcRes] = await Promise.all([
    fetch(`${BASE}/data/2.5/weather?${q}`),
    fetch(`${BASE}/data/2.5/forecast?${q}`)
  ]);

  if (!curRes.ok) throw apiError(curRes);
  if (!fcRes.ok)  throw apiError(fcRes);

  const [current, forecast] = await Promise.all([curRes.json(), fcRes.json()]);
  render(current, forecast, label);
}


function buildDailyDays(forecast, tzOffsetSec) {
  const byDay = new Map();

  for (const item of forecast.list) {
    // Shift the UTC timestamp by the city offset, then read it as UTC
    const local = new Date((item.dt + tzOffsetSec) * 1000);
    const key   = local.toISOString().slice(0, 10);   // YYYY-MM-DD
    const hour  = local.getUTCHours();

    if (!byDay.has(key)) {
      byDay.set(key, { key, min: Infinity, max: -Infinity, midday: null, diff: 99 });
    }
    const day = byDay.get(key);

    day.min = Math.min(day.min, item.main.temp_min);
    day.max = Math.max(day.max, item.main.temp_max);

    // Keep the entry closest to local noon — best representative icon
    const d = Math.abs(hour - 12);
    if (d < day.diff) { day.diff = d; day.midday = item; }
  }

  return [...byDay.values()].sort((a, b) => a.key.localeCompare(b.key));
}

 
function render(current, forecast, label) {
  const tz      = current.timezone;                        // seconds
  const degSym  = UNITS === 'metric' ? 'C' : 'F';
  const windSym = UNITS === 'metric' ? 'km/h' : 'mph';
  const rainSym = UNITS === 'metric' ? 'mm' : 'in';

  const w    = current.weather[0];
  const info = owmInfo(w.id, w.icon);

   
  document.body.className = 'theme-' + info.theme;

   
  const localTime = new Date((current.dt + tz) * 1000).toLocaleString(undefined, {
    weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

   
  const wind = UNITS === 'metric'
    ? current.wind.speed * 3.6
    : current.wind.speed;

   
  const precip = (current.rain?.['1h'] || 0) + (current.snow?.['1h'] || 0);

   
  const days = buildDailyDays(forecast, tz).slice(1, 6).map((day) => {
    const mw   = day.midday.weather[0];
    const d    = owmInfo(mw.id, mw.icon);
    const name = new Date(day.key + 'T12:00:00Z')
      .toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });

    return `
      <div class="day">
        <span class="dname">${esc(name)}</span>
        <span class="dicon">${d.icon}</span>
        <div class="dtemps">
          <span class="dmax">${Math.round(day.max)}°</span>
          <span class="dmin">${Math.round(day.min)}°</span>
        </div>
      </div>`;
  }).join('');

  output.innerHTML = `
    <div class="fade-in">
      <div class="place">
        <h2>${esc(label)}</h2>
        <p>${esc(localTime)} · ${esc(fmtOffset(tz))}</p>
      </div>

      <div class="main">
        <div class="icon">${info.icon}</div>
        <div>
          <div class="temp">${Math.round(current.main.temp)}°<span>${degSym}</span></div>
          <div class="desc">${esc(w.description || info.label)}</div>
        </div>
      </div>

      <div class="details">
        <div class="detail"><span>Feels like</span><strong>${Math.round(current.main.feels_like)}°${degSym}</strong></div>
        <div class="detail"><span>Humidity</span><strong>${current.main.humidity}%</strong></div>
        <div class="detail"><span>Wind</span><strong>${Math.round(wind)} ${windSym}</strong></div>
        <div class="detail"><span>Precipitation</span><strong>${precip.toFixed(1)} ${rainSym}</strong></div>
      </div>

      <div class="forecast">
        <h3>Next 5 days</h3>
        <div class="days">${days}</div>
      </div>
    </div>`;
}

 
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
    showError('Add your OpenWeatherMap API key to the API_KEY constant at the top of the script.');
    return;
  }

  const city = input.value.trim();
  if (!city) { input.focus(); return; }

  try {
    await searchByCity(city);
  } catch (err) {
    showError(err.message || 'Something went wrong.');
  }
});

geoBtn.addEventListener('click', () => {
  if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
    showError('Add your OpenWeatherMap API key to the API_KEY constant at the top of the script.');
    return;
  }
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by this browser.');
    return;
  }

  showLoading('Getting your location…');

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
         
        let label = 'My location';
        try {
          const r = await fetch(`${BASE}/geo/1.0/reverse`
            + `?lat=${lat}&lon=${lon}&limit=1&appid=${encodeURIComponent(API_KEY)}`);
          if (r.ok) {
            const list = await r.json();
            if (list.length) {
              const p = list[0];
              label = [p.name, p.state && p.state !== p.name ? p.state : null, p.country]
                .filter(Boolean).join(', ');
            }
          }
        } catch { /* keep the fallback label */ }

        await loadWeather(lat, lon, label);
      } catch (err) {
        showError(err.message || 'Could not load weather.');
      }
    },
    () => showError('Location permission denied.'),
    { timeout: 10000 }
  );
});