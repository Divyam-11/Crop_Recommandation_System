import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Compass,
  Droplets,
  FlaskConical,
  Layers,
  Leaf,
  LocateFixed,
  MapPin,
  Maximize2,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  Wind,
  X,
  CircleHelp,
  LoaderCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import crops from "./data/crops.json";
import "./App.css";

const FEATURES = [
  {
    key: "Temperature",
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 60,
    step: 0.1,
    icon: Thermometer,
    color: "#e4b97a",
  },
  {
    key: "Humidity",
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100,
    step: 0.1,
    icon: Droplets,
    color: "#9fcac9",
  },
  {
    key: "Rainfall",
    label: "Rainfall",
    unit: "mm",
    min: 0,
    max: 500,
    step: 0.1,
    icon: CloudRain,
    color: "#b0c6e0",
  },
  {
    key: "PH",
    label: "Soil pH",
    unit: "pH",
    min: 0,
    max: 14,
    step: 0.01,
    icon: FlaskConical,
    color: "#d8df9e",
  },
  {
    key: "Nitrogen",
    label: "Nitrogen",
    short: "N",
    unit: "kg/ha",
    min: 0,
    max: 500,
    step: 0.1,
    color: "#cedd92",
  },
  {
    key: "Phosphorous",
    label: "Phosphorus",
    short: "P",
    unit: "kg/ha",
    min: 0,
    max: 500,
    step: 0.1,
    color: "#e4b97a",
  },
  {
    key: "Potassium",
    label: "Potassium",
    short: "K",
    unit: "kg/ha",
    min: 0,
    max: 600,
    step: 0.1,
    color: "#b7c6a0",
  },
  {
    key: "Carbon",
    label: "Carbon",
    short: "C",
    unit: "content",
    min: 0,
    max: 15,
    step: 0.01,
    color: "#9fcac9",
  },
];
const SOILS = [
  "Loamy Soil",
  "Neutral Soil",
  "Acidic Soil",
  "Peaty Soil",
  "Alkaline Soil",
];
const PRESETS = ["rice", "wheat", "Cotton", "maize"];
const START = crops.find((crop) => crop.name === "rice").sample;
const DEFAULT_LOCATION = {
  lat: 18.5204,
  lon: 73.8567,
  name: "Pune demo field",
  region: "Maharashtra, India",
  demo: true,
};
const FIELD_PHOTO =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85";
const WHEAT_PHOTO =
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=85";
const titleCase = (text) =>
  text.replace(/\b\w/g, (letter) => letter.toUpperCase());
const display = (value, digits = 1) =>
  Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits });
const dayLabel = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
const storageRead = () => {
  try {
    const data = JSON.parse(localStorage.getItem("agroterra-reports") || "[]");
    return Array.isArray(data)
      ? data.filter(
          (item) => item?.id && item?.crop && item?.inputs && item?.location,
        )
      : [];
  } catch {
    return [];
  }
};
const weatherLabel = (code) =>
  code === 0
    ? "Clear skies"
    : code <= 3
      ? "Partly cloudy"
      : code <= 48
        ? "Misty conditions"
        : code <= 67
          ? "Rain expected"
          : code <= 77
            ? "Snow showers"
            : code <= 82
              ? "Rain showers"
              : "Thunderstorms";

function WheatArt() {
  return (
    <svg className="wheat-art" viewBox="0 0 260 350" aria-hidden="true">
      <defs>
        <linearGradient id="grain" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffebac" />
          <stop offset=".45" stopColor="#d6b461" />
          <stop offset="1" stopColor="#86703a" />
        </linearGradient>
        <linearGradient id="stem" x1="0" x2="1">
          <stop stopColor="#a18443" />
          <stop offset=".5" stopColor="#f5dd99" />
          <stop offset="1" stopColor="#a3843e" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="3" dy="6" stdDeviation="6" floodOpacity=".25" />
        </filter>
      </defs>
      <g transform="rotate(30 130 175)" filter="url(#shadow)">
        <path
          d="M130 331 Q124 175 130 57"
          fill="none"
          stroke="url(#stem)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <path
              d={`M${127 - i * 0.4} ${175 - i * 14} Q${85 - i} ${161 - i * 14} ${101 - i * 0.2} ${140 - i * 14} Q131 ${140 - i * 14} ${127 - i * 0.4} ${175 - i * 14}`}
              fill="url(#grain)"
              stroke="#e5c87d"
              strokeWidth=".7"
            />
            <path
              d={`M${132 + i * 0.4} ${168 - i * 14} Q${169 + i} ${156 - i * 14} ${157 + i * 0.2} ${133 - i * 14} Q130 ${138 - i * 14} ${132 + i * 0.4} ${168 - i * 14}`}
              fill="url(#grain)"
              stroke="#e5c87d"
              strokeWidth=".7"
            />
            <path
              d={`M${100 - i * 0.2} ${142 - i * 14} L${88 - i} ${99 - i * 14} M${158 + i * 0.2} ${136 - i * 14} L${176 + i} ${91 - i * 14}`}
              stroke="#dbbf74"
              strokeWidth=".8"
              opacity=".8"
            />
          </g>
        ))}
        <path d="M130 53 Q111 33 130 10 Q148 34 130 53" fill="url(#grain)" />
        <path d="M131 30 L132 0" stroke="#dbbf74" strokeWidth="1" />
      </g>
    </svg>
  );
}

function FieldMap({ location, onSelect, satellite = false }) {
  const container = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  useEffect(() => {
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView([location.lat, location.lon], 12);
    map.current = instance;
    L.tileLayer(
      satellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: satellite
          ? "Tiles © Esri, Maxar, Earthstar Geographics"
          : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      },
    ).addTo(instance);
    L.control.zoom({ position: "bottomright" }).addTo(instance);
    marker.current = L.marker([location.lat, location.lon], {
      icon: L.divIcon({
        className: "field-marker",
        html: "<span></span>",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    }).addTo(instance);
    instance.on("click", (event) =>
      select.current({
        lat: event.latlng.lat,
        lon: event.latlng.lng,
        name: "Selected field",
        region: "Custom map location",
        demo: false,
      }),
    );
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
    // Location updates are handled separately without rebuilding the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satellite]);
  useEffect(() => {
    map.current?.setView([location.lat, location.lon], map.current.getZoom());
    marker.current?.setLatLng([location.lat, location.lon]);
  }, [location]);
  return (
    <div
      className="field-map"
      ref={container}
      aria-label="Interactive field map. Click to select a location."
    />
  );
}

function Gauge({ feature, value, onChange, active, onActivate }) {
  const Icon = feature.icon;
  const fraction = Math.min(1, Math.max(0, Number(value) / feature.max));
  return (
    <div className={`gauge-item ${active ? "gauge-active" : ""}`}>
      <button
        className="gauge-button"
        onClick={onActivate}
        aria-label={`Edit ${feature.label}`}
        style={{ "--gauge-color": feature.color }}
      >
        <svg viewBox="0 0 110 110" className="gauge-svg">
          <circle cx="55" cy="55" r="46" className="gauge-track" />
          <circle
            cx="55"
            cy="55"
            r="46"
            className="gauge-fill"
            strokeDasharray={`${fraction * 289} 289`}
          />
        </svg>
        <span className="gauge-content">
          <Icon size={16} />
          <strong>{display(value, feature.key === "PH" ? 2 : 1)}</strong>
          <small>{feature.unit}</small>
        </span>
        <span className="gauge-edit">
          <Plus size={11} />
        </span>
      </button>
      <span className="gauge-label">{feature.label}</span>
      {active && (
        <div className="gauge-editor">
          <label>
            {feature.label}
            <input
              aria-label={`${feature.label} value`}
              type="number"
              min={feature.min}
              max={feature.max}
              step={feature.step}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
          <input
            aria-label={`${feature.label} slider`}
            type="range"
            min={feature.min}
            max={feature.max}
            step={feature.step}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function Radar({ values, profile }) {
  const keys = FEATURES.slice(0, 6);
  const point = (index, ratio) => {
    const angle = (Math.PI * 2 * index) / keys.length - Math.PI / 2;
    return [
      100 + Math.cos(angle) * 66 * ratio,
      89 + Math.sin(angle) * 66 * ratio,
    ];
  };
  const polygon = (source) =>
    keys
      .map((feature, i) =>
        point(i, Math.min(1, Number(source[feature.key]) / feature.max)).join(
          ",",
        ),
      )
      .join(" ");
  return (
    <svg
      viewBox="0 0 200 190"
      className="radar"
      role="img"
      aria-label="Your inputs compared with dataset averages for the recommended crop"
    >
      {[0.33, 0.66, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={keys.map((_, i) => point(i, ratio).join(",")).join(" ")}
          fill="none"
          stroke="rgba(233,239,214,.13)"
        />
      ))}
      {keys.map((feature, i) => {
        const [x, y] = point(i, 1.22);
        const [endX, endY] = point(i, 1);
        return (
          <g key={feature.key}>
            <line
              x1="100"
              y1="89"
              x2={endX}
              y2={endY}
              stroke="rgba(233,239,214,.1)"
            />
            <text x={x} y={y + 3} textAnchor="middle">
              {["Temp", "Humidity", "Rain", "pH", "N", "P"][i]}
            </text>
          </g>
        );
      })}
      {profile && (
        <polygon
          points={polygon(profile.mean)}
          fill="rgba(165,190,199,.12)"
          stroke="#91acb0"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
      <polygon
        points={polygon(values)}
        fill="rgba(210,231,131,.18)"
        stroke="#d0e58c"
        strokeWidth="2"
      />
      {keys.map((feature, i) => {
        const [x, y] = point(
          i,
          Math.min(1, Number(values[feature.key]) / feature.max),
        );
        return (
          <circle key={feature.key} cx={x} cy={y} r="2.5" fill="#d0e58c" />
        );
      })}
    </svg>
  );
}

function Forecast({ weather, status }) {
  if (!weather)
    return (
      <div className="forecast-empty">
        <CloudRain size={28} />
        <span>
          {status === "loading"
            ? "Reading the skies…"
            : "Forecast currently unavailable"}
        </span>
        <small>
          {status === "loading"
            ? "Fetching weather for your selected field"
            : "You can still enter climate values manually."}
        </small>
      </div>
    );
  const daily = weather.daily;
  return (
    <div className="forecast-days">
      {daily.time.map((date, index) => (
        <div
          key={date}
          className={`forecast-day ${index === 0 ? "forecast-today" : ""}`}
        >
          <span>{index === 0 ? "Today" : dayLabel(date)}</span>
          {daily.weather_code[index] >= 51 ? (
            <CloudRain size={22} />
          ) : (
            <Sun size={22} />
          )}
          <strong>
            {Math.round(daily.temperature_2m_max[index])}°
            <small> / {Math.round(daily.temperature_2m_min[index])}°</small>
          </strong>
          <div className="rain-bar">
            <i
              style={{
                height: `${Math.max(6, Math.min(100, daily.precipitation_sum[index] * 7))}%`,
              }}
            />
          </div>
          <small>{display(daily.precipitation_sum[index])} mm</small>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const previous = document.activeElement;
    const close = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelector(".modal-close")?.focus();
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll(
              'button, a, input, select, [tabindex="0"]',
            ),
          ].filter((element) => !element.disabled);
          if (event.shiftKey && document.activeElement === controls[0]) {
            event.preventDefault();
            controls.at(-1)?.focus();
          }
          if (!event.shiftKey && document.activeElement === controls.at(-1)) {
            event.preventDefault();
            controls[0]?.focus();
          }
        }}
      >
        <header>
          <div>
            <span className="eyebrow">AGROTERRA WORKSPACE</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-button modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("overview");
  const [values, setValues] = useState({ ...START });
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [activeGauge, setActiveGauge] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("loading");
  const [weatherError, setWeatherError] = useState("");
  const [weatherRefresh, setWeatherRefresh] = useState(0);
  const [satellite, setSatellite] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [gpsBusy, setGpsBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [reports, setReports] = useState(storageRead);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [cropQuery, setCropQuery] = useState("");
  const [soilFilter, setSoilFilter] = useState("All soils");
  const [mobileNav, setMobileNav] = useState(false);
  const [modelStatus, setModelStatus] = useState("checking");
  const [inputSource, setInputSource] = useState("Rice dataset scenario");
  const requestId = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/health", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(() => setModelStatus("online"))
      .catch(() => {
        if (!controller.signal.aborted) setModelStatus("offline");
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setWeatherStatus("loading");
    setWeather(null);
    setWeatherError("");
    const parameters = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      current:
        "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "auto",
      forecast_days: "7",
    });
    const timeout = setTimeout(() => {
      controller.abort();
      setWeatherStatus("error");
      setWeatherError("Weather request timed out. Try again.");
    }, 18000);
    fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Weather service is unavailable.");
        return response.json();
      })
      .then((data) => {
        if (!data.current || !data.daily)
          throw new Error("Weather data is incomplete.");
        setWeather(data);
        setWeatherStatus("live");
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setWeatherStatus("error");
          setWeatherError(
            err.message === "Failed to fetch"
              ? "Weather service could not be reached. Try again or enter values manually."
              : err.message,
          );
        }
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [location.lat, location.lon, weatherRefresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const setValue = (key, value) => {
    requestId.current += 1;
    setBusy(false);
    setValues((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setError("");
    setInputSource("Custom field measurements");
  };
  const selectLocation = (place) => {
    requestId.current += 1;
    setBusy(false);
    setResult(null);
    setLocation(place);
    setSearchResults([]);
    setQuery("");
    setSearchMessage("");
    setToast("Field location updated. Soil values stay as entered.");
  };
  const useGPS = () => {
    if (!navigator.geolocation) {
      setToast(
        "GPS is unavailable in this browser. Search for a city or click the map.",
      );
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: "My GPS location",
          region: `GPS accuracy ±${Math.round(position.coords.accuracy)} m`,
          demo: false,
        });
        setGpsBusy(false);
      },
      (err) => {
        setGpsBusy(false);
        setToast(
          err.code === 1
            ? "Location permission was declined. Search for a city or select a point on the map."
            : "GPS location could not be determined. Select your field on the map.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };
  const searchLocation = async (event) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setSearchMessage("Enter at least two characters.");
      return;
    }
    setSearching(true);
    setSearchMessage("");
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`,
        { signal: AbortSignal.timeout(12000) },
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSearchResults(data.results || []);
      if (!data.results?.length)
        setSearchMessage("No places found. Try a nearby city.");
    } catch {
      setSearchMessage(
        "Location search is unavailable. You can still click the map.",
      );
    } finally {
      setSearching(false);
    }
  };
  const loadScenario = (name) => {
    const crop = crops.find((item) => item.name === name);
    requestId.current += 1;
    setBusy(false);
    setValues({ ...crop.sample });
    setResult(null);
    setError("");
    setInputSource(`${titleCase(name)} dataset scenario`);
    setToast(`${titleCase(name)} scenario loaded from the training dataset.`);
  };
  const importWeather = () => {
    if (!weather) return;
    requestId.current += 1;
    setBusy(false);
    setValues((previous) => ({
      ...previous,
      Temperature: weather.current.temperature_2m,
      Humidity: weather.current.relative_humidity_2m,
    }));
    setResult(null);
    setInputSource("Live temperature & humidity + manual soil inputs");
    setToast(
      "Current temperature and humidity applied. Review rainfall and soil values before predicting.",
    );
  };
  const predict = async () => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        key === "Soil" ? value : Number(value),
      ]),
    );
    const invalid = FEATURES.find(
      (feature) =>
        values[feature.key] === "" ||
        !Number.isFinite(payload[feature.key]) ||
        payload[feature.key] < feature.min ||
        payload[feature.key] > feature.max,
    );
    if (invalid) {
      setError(
        `Enter ${invalid.label.toLowerCase()} between ${invalid.min} and ${invalid.max} ${invalid.unit}.`,
      );
      setActiveGauge(invalid.key);
      return;
    }
    setBusy(true);
    setError("");
    const id = ++requestId.current;
    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed.");
      if (!data.predicted_crop)
        throw new Error("The model returned an empty recommendation.");
      if (id !== requestId.current) return;
      setResult({
        crop: data.predicted_crop,
        inputs: payload,
        location: { ...location },
        source: inputSource,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(),
      });
      setModelStatus("online");
    } catch (err) {
      if (id !== requestId.current) return;
      setError(
        err.name === "TimeoutError"
          ? "The model took too long to respond. Please try again."
          : err.message === "Failed to fetch"
            ? "Cannot reach the prediction server. Make sure the backend is running."
            : err.message,
      );
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  };
  const saveReports = (updated) => {
    try {
      localStorage.setItem("agroterra-reports", JSON.stringify(updated));
      setReports(updated);
      return true;
    } catch {
      setToast(
        "Browser storage is full or disabled. Export the report to keep a copy.",
      );
      return false;
    }
  };
  const saveAnalysis = () => {
    if (!result) return;
    if (reports.some((report) => report.id === result.id)) {
      setToast("This analysis is already saved.");
      return;
    }
    if (saveReports([result, ...reports].slice(0, 40)))
      setToast("Analysis saved to your browser.");
  };
  const exportReport = (report = result) => {
    if (!report) {
      setToast("Run a crop analysis first to export a report.");
      return;
    }
    const profile = crops.find(
      (crop) => crop.name.toLowerCase() === report.crop.toLowerCase(),
    );
    const content = {
      project: "Agroterra · Crop Intelligence",
      generatedAt: report.timestamp,
      recommendedCrop: report.crop,
      location: report.location,
      inputs: report.inputs,
      inputSource: report.source,
      referenceDataset: {
        records: 3100,
        crops: crops.length,
        recommendedCropReference: profile,
      },
      notes: [
        "Prediction from the project’s trained model. No probability or yield estimate is supplied.",
        "Location weather and entered soil data are independent sources.",
        "Dataset ranges are descriptive, not agronomic prescriptions.",
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `agroterra-${report.crop.replace(/\s/g, "-")}-${report.timestamp.slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Field analysis exported.");
  };
  const restoreReport = (report) => {
    requestId.current += 1;
    setBusy(false);
    setValues({ ...report.inputs });
    setLocation(report.location);
    setInputSource(report.source);
    setResult(report);
    setTab("overview");
    setError("");
    setToast("Saved analysis restored.");
  };
  const recommendedProfile =
    result &&
    crops.find((crop) => crop.name.toLowerCase() === result.crop.toLowerCase());
  const similarCrops = useMemo(
    () =>
      crops
        .map((crop) => ({
          ...crop,
          distance:
            FEATURES.reduce(
              (sum, feature) =>
                sum +
                Math.pow(
                  (Number(values[feature.key]) - crop.mean[feature.key]) /
                    feature.max,
                  2,
                ),
              0,
            ) + (crop.soils.includes(values.Soil) ? 0 : 0.15),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3),
    [values],
  );
  const filteredCrops = crops.filter(
    (crop) =>
      crop.name.toLowerCase().includes(cropQuery.toLowerCase()) &&
      (soilFilter === "All soils" || crop.soils.includes(soilFilter)),
  );
  const readyCount =
    FEATURES.filter(
      (feature) =>
        values[feature.key] !== "" &&
        Number.isFinite(Number(values[feature.key])),
    ).length + (values.Soil ? 1 : 0);
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="app-shell">
      <aside className="rail">
        <a
          href="#"
          className="brand-mark"
          aria-label="Agroterra home"
          onClick={(event) => {
            event.preventDefault();
            setTab("overview");
          }}
        >
          <Sprout size={28} />
        </a>
        <div className="rail-line" />
        <button
          className={`rail-button ${tab === "overview" ? "active" : ""}`}
          onClick={() => setTab("overview")}
          aria-label="Field overview"
          title="Field overview"
        >
          <Layers size={21} />
        </button>
        <button
          className={`rail-button ${tab === "explore" ? "active" : ""}`}
          onClick={() => setTab("explore")}
          aria-label="Crop explorer"
          title="Crop explorer"
        >
          <Leaf size={21} />
        </button>
        <button
          className={`rail-button ${tab === "reports" ? "active" : ""}`}
          onClick={() => setTab("reports")}
          aria-label="Saved analyses"
          title="Saved analyses"
        >
          <Bookmark size={21} />
          {reports.length > 0 && <i />}
        </button>
        <div className="rail-bottom">
          <button
            className="rail-button"
            onClick={() => setModal("help")}
            aria-label="How it works"
          >
            <CircleHelp size={21} />
          </button>
          <span className="avatar" title="Student workspace">
            DS
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="wordmark">
            agroterra<span>FIELD INTELLIGENCE</span>
          </div>
          <nav
            className={mobileNav ? "nav-open" : ""}
            aria-label="Main navigation"
          >
            {[
              ["overview", "Overview"],
              ["explore", "Crop explorer"],
              ["reports", "Saved analyses"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={tab === key ? "nav-active" : ""}
                onClick={() => {
                  setTab(key);
                  setMobileNav(false);
                }}
              >
                {label}
                {key === "reports" && reports.length > 0 && (
                  <span>{reports.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="topbar-actions">
            <span className={`model-badge ${modelStatus}`}>
              <i />
              {modelStatus === "online"
                ? "Model connected"
                : modelStatus === "checking"
                  ? "Connecting model"
                  : "Model unavailable"}
            </span>
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <button
              className="help-top icon-button"
              onClick={() => setModal("help")}
              aria-label="Help"
            >
              <CircleHelp size={20} />
            </button>
          </div>
        </header>
        {tab === "overview" && (
          <main>
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="tiny-line" /> THE FUTURE IS ROOTED IN YOUR
                  FIELD
                </div>
                <h1>
                  Make every acre <em>count.</em>
                </h1>
                <p>
                  A little intelligence. A better harvest. Let’s find what your
                  land can grow.
                </p>
              </div>
              <div className="heading-actions">
                <span className="date-label">
                  {date}
                  <span>YOUR FIELD WORKSPACE</span>
                </span>
                <button
                  className="secondary-button"
                  onClick={() => exportReport()}
                  disabled={!result}
                >
                  <ArrowDownToLine size={16} /> Export report
                </button>
              </div>
            </section>
            <div className="dashboard-grid">
              <section className="panel conditions-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">01 / UNDERSTAND YOUR LAND</span>
                    <h2>Field conditions</h2>
                  </div>
                  <SlidersHorizontal size={18} />
                </div>
                <div className="conditions-intro">
                  <span>
                    <i className="status-dot" /> {readyCount}/9 inputs ready
                  </span>
                  <button
                    className="text-button"
                    onClick={() => {
                      loadScenario("rice");
                      setActiveGauge(null);
                    }}
                    aria-label="Reset to rice demo"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>
                <div className="gauges-grid">
                  {FEATURES.slice(0, 4).map((feature) => (
                    <Gauge
                      key={feature.key}
                      feature={feature}
                      value={values[feature.key]}
                      onChange={(value) => setValue(feature.key, value)}
                      active={activeGauge === feature.key}
                      onActivate={() =>
                        setActiveGauge(
                          activeGauge === feature.key ? null : feature.key,
                        )
                      }
                    />
                  ))}
                </div>
                <p className="input-hint">
                  Click a dial to fine-tune your measurements.
                </p>
                <div className="soil-select">
                  <span>
                    <Layers size={16} /> Soil composition
                  </span>
                  <div>
                    <select
                      aria-label="Soil composition"
                      value={values.Soil}
                      onChange={(event) => setValue("Soil", event.target.value)}
                    >
                      {SOILS.map((soil) => (
                        <option key={soil}>{soil}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <div className="nutrient-heading">
                  <h3>Inside the soil</h3>
                  <span>NUTRIENT PROFILE</span>
                </div>
                <div className="nutrient-grid">
                  {FEATURES.slice(4).map((feature) => (
                    <label className="nutrient" key={feature.key}>
                      <span
                        className="nutrient-symbol"
                        style={{ color: feature.color }}
                      >
                        {feature.short}
                      </span>
                      <div>
                        <span>{feature.label}</span>
                        <div className="nutrient-value">
                          <input
                            type="number"
                            aria-label={feature.label}
                            min={feature.min}
                            max={feature.max}
                            step={feature.step}
                            value={values[feature.key]}
                            onChange={(event) =>
                              setValue(feature.key, event.target.value)
                            }
                          />
                          <small>{feature.unit}</small>
                        </div>
                      </div>
                      <input
                        className="nutrient-slider"
                        type="range"
                        aria-label={`${feature.label} slider`}
                        min={feature.min}
                        max={feature.max}
                        step={feature.step}
                        value={values[feature.key]}
                        onChange={(event) =>
                          setValue(feature.key, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
                <div className="condition-source">
                  <FlaskConical size={13} />
                  <span>{inputSource}</span>
                </div>
              </section>
              <section
                className={`panel intelligence-panel ${result ? "has-result" : ""}`}
              >
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">
                      02 / DISCOVER YOUR POTENTIAL
                    </span>
                    <h2>Crop intelligence</h2>
                  </div>
                  <span className="small-tag">
                    MODEL POWERED <Sprout size={11} />
                  </span>
                </div>
                <div className="intelligence-intro">
                  <span className="eyebrow">
                    {result
                      ? "YOUR FIELD’S NEXT CHAPTER"
                      : "BETTER DECISIONS, FROM THE GROUND UP"}
                  </span>
                  <h3>
                    {result ? (
                      titleCase(result.crop)
                    ) : (
                      <>
                        Good soil.
                        <br />
                        <em>Great possibilities.</em>
                      </>
                    )}
                  </h3>
                  <p>
                    {result
                      ? `Recommended for your ${values.Soil.toLowerCase()} and measured field conditions.`
                      : "Every field has a story. Find the crop that belongs in yours."}
                  </p>
                </div>
                <div className="crop-orbit">
                  <svg className="orbit-svg" viewBox="0 0 360 360">
                    <circle
                      className="orbit-background"
                      cx="180"
                      cy="180"
                      r="153"
                    />
                    <circle className="orbit-ring" cx="180" cy="180" r="153" />
                    <circle
                      className="orbit-accent"
                      cx="180"
                      cy="180"
                      r="153"
                    />
                    <circle
                      cx="180"
                      cy="180"
                      r="135"
                      fill="none"
                      stroke="rgba(213,231,143,.08)"
                      strokeDasharray="2 9"
                    />
                  </svg>
                  <span className="orbit-dot dot-one" />
                  <span className="orbit-dot dot-two" />
                  <WheatArt />
                  <span className="orbit-label label-one">
                    <i /> Soil + climate
                  </span>
                  <span className="orbit-label label-two">
                    <i /> {crops.length} crop possibilities
                  </span>
                  <span className="orbit-bottom">
                    <Sprout size={14} />
                    {result
                      ? "A recommendation rooted in data"
                      : "Small inputs. A world of possibility."}
                  </span>
                </div>
                <div className="intelligence-stats">
                  <div>
                    <strong>
                      3,100<span> records</span>
                    </strong>
                    <small>TRAINING DATASET</small>
                  </div>
                  <div>
                    <strong>
                      9<span> inputs</span>
                    </strong>
                    <small>YOUR FIELD, UNDERSTOOD</small>
                  </div>
                  <div>
                    <strong>
                      {crops.length}
                      <span> crops</span>
                    </strong>
                    <small>ONE SMARTER CHOICE</small>
                  </div>
                </div>
                <div className="prediction-actions">
                  <button
                    className="primary-button predict-button"
                    onClick={predict}
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <LoaderCircle size={18} className="spin" /> Analysing
                        your field…
                      </>
                    ) : (
                      <>
                        <Sprout size={18} />
                        {result ? "Run analysis again" : "Find my ideal crop"}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  {result && (
                    <button
                      className="save-button"
                      onClick={saveAnalysis}
                      aria-label="Save analysis"
                      title="Save analysis"
                    >
                      {reports.some((report) => report.id === result.id) ? (
                        <Check size={19} />
                      ) : (
                        <Bookmark size={19} />
                      )}
                    </button>
                  )}
                </div>
                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}
                <p className="prediction-note">
                  {result
                    ? "Model output · No confidence probability or yield estimate supplied"
                    : "Built on your measurements. Powered by the trained crop model."}
                </p>
              </section>
              <div className="right-stack">
                <section className="panel location-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">03 / A PLACE TO GROW</span>
                      <h2>Your field, on the map</h2>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => setModal("map")}
                      aria-label="Expand map"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                  <div className="location-name">
                    <MapPin size={16} />
                    <div>
                      <strong>{location.name}</strong>
                      <span>{location.region}</span>
                    </div>
                    {location.demo && <span className="demo-tag">DEMO</span>}
                  </div>
                  <div className="map-wrap">
                    <FieldMap
                      location={location}
                      onSelect={selectLocation}
                      satellite={satellite}
                    />
                    <button
                      className="map-layer-button"
                      onClick={() => setSatellite(!satellite)}
                      title="Switch map layer"
                      aria-label="Switch map layer"
                    >
                      <Layers size={15} />
                      {satellite ? "Street" : "Satellite"}
                    </button>
                  </div>
                  <div className="coordinates">
                    <span>
                      {Math.abs(location.lat).toFixed(4)}°{" "}
                      {location.lat >= 0 ? "N" : "S"}
                      <span className="coordinate-divider">/</span>
                      {Math.abs(location.lon).toFixed(4)}°{" "}
                      {location.lon >= 0 ? "E" : "W"}
                    </span>
                    <Compass size={14} />
                  </div>
                  <button
                    className="gps-button"
                    onClick={useGPS}
                    disabled={gpsBusy}
                  >
                    {gpsBusy ? (
                      <LoaderCircle size={15} className="spin" />
                    ) : (
                      <LocateFixed size={15} />
                    )}{" "}
                    {gpsBusy ? "Finding your location…" : "Use my GPS location"}
                    <ArrowUpRight size={15} />
                  </button>
                  <form className="location-search" onSubmit={searchLocation}>
                    <Search size={15} />
                    <input
                      aria-label="Search for a city"
                      placeholder="Or search a city…"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="icon-button"
                      aria-label="Search location"
                      disabled={searching}
                    >
                      {searching ? (
                        <LoaderCircle size={14} className="spin" />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </button>
                  </form>
                  {searchMessage && (
                    <p className="search-message" role="status">
                      {searchMessage}
                    </p>
                  )}
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((place) => (
                        <button
                          key={place.id}
                          onClick={() =>
                            selectLocation({
                              lat: place.latitude,
                              lon: place.longitude,
                              name: place.name,
                              region: [place.admin1, place.country]
                                .filter(Boolean)
                                .join(", "),
                              demo: false,
                            })
                          }
                        >
                          <MapPin size={13} />
                          <span>
                            {place.name}
                            <small>
                              {place.admin1}, {place.country}
                            </small>
                          </span>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="map-hint">
                    Click anywhere on the map to select a field.
                  </p>
                </section>
                <section
                  className="field-story"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(14,31,20,.94), rgba(14,31,20,.05) 90%), url(${FIELD_PHOTO})`,
                  }}
                >
                  <span className="story-tag">
                    <Leaf size={12} /> GROW WITH PURPOSE
                  </span>
                  <div>
                    <h3>
                      A healthier field.
                      <br />A better tomorrow.
                    </h3>
                    <button onClick={() => setModal("help")}>
                      See how it works <ArrowUpRight size={16} />
                    </button>
                  </div>
                </section>
              </div>
            </div>
            <div className="secondary-grid">
              <section className="panel scenario-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">A QUICK PLACE TO START</span>
                    <h2>Try a field scenario</h2>
                  </div>
                  <FlaskConical size={17} />
                </div>
                <p>Explore real sample inputs from our training dataset.</p>
                <div className="scenario-buttons">
                  {PRESETS.map((name, index) => (
                    <button key={name} onClick={() => loadScenario(name)}>
                      <span>{["🌾", "🌿", "☁", "🌽"][index]}</span>
                      {titleCase(name)}
                      <ArrowUpRight size={13} />
                    </button>
                  ))}
                </div>
                <small>Demo measurements · editable for your own field</small>
              </section>
              <section className="panel forecast-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">PLAN WITH THE SKIES IN MIND</span>
                    <h2>
                      The week ahead{" "}
                      <span className={`weather-tag ${weatherStatus}`}>
                        <i />
                        {weatherStatus === "live"
                          ? "LIVE FORECAST"
                          : weatherStatus === "loading"
                            ? "CONNECTING"
                            : "UNAVAILABLE"}
                      </span>
                    </h2>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setWeatherRefresh((value) => value + 1)}
                    aria-label="Refresh weather"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
                <Forecast weather={weather} status={weatherStatus} />
                <div className="weather-footer">
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open-Meteo <ExternalLink size={10} />
                  </a>
                  {weather && (
                    <span>
                      <Wind size={13} />
                      {display(weather.current.wind_speed_10m)} km/h{" "}
                      <span className="forecast-condition">
                        · {weatherLabel(weather.current.weather_code)}
                      </span>
                    </span>
                  )}
                  <button
                    className="text-button"
                    onClick={importWeather}
                    disabled={!weather}
                  >
                    <Plus size={13} /> Use live climate
                  </button>
                </div>
                {weatherError && (
                  <p className="weather-error">{weatherError}</p>
                )}
              </section>
            </div>
            {result && (
              <section className="analysis-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      TURN INSIGHT INTO YOUR NEXT STEP
                    </span>
                    <h2>Your field analysis</h2>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => exportReport()}
                  >
                    <ArrowDownToLine size={15} /> Download analysis
                  </button>
                </div>
                <div className="analysis-grid">
                  <section className="panel radar-panel">
                    <div className="panel-heading">
                      <h3>Conditions at a glance</h3>
                      <span className="small-tag">
                        {titleCase(result.crop)}
                      </span>
                    </div>
                    <Radar
                      values={result.inputs}
                      profile={recommendedProfile}
                    />
                    <div className="chart-legend">
                      <span>
                        <i /> Your field
                      </span>
                      <span>
                        <i /> Crop dataset average
                      </span>
                    </div>
                  </section>
                  <section className="panel reference-panel">
                    <div className="panel-heading">
                      <h3>Why this crop?</h3>
                      <Sprout size={17} />
                    </div>
                    <p>
                      The trained model selected{" "}
                      <strong>{titleCase(result.crop)}</strong> from your eight
                      numerical measurements and soil type.
                    </p>
                    {recommendedProfile && (
                      <>
                        <div className="reference-metrics">
                          <div>
                            <small>Dataset temperature range</small>
                            <strong>
                              {display(
                                recommendedProfile.ranges.Temperature[0],
                              )}
                              –
                              {display(
                                recommendedProfile.ranges.Temperature[1],
                              )}{" "}
                              <span>°C</span>
                            </strong>
                          </div>
                          <div>
                            <small>Dataset pH range</small>
                            <strong>
                              {display(recommendedProfile.ranges.PH[0])}–
                              {display(recommendedProfile.ranges.PH[1])}
                            </strong>
                          </div>
                        </div>
                        <p className="reference-note">
                          These ranges describe the project dataset. They are
                          reference values, not model explanations or
                          cultivation guarantees.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => setModal(recommendedProfile)}
                        >
                          Explore crop profile <ArrowUpRight size={14} />
                        </button>
                      </>
                    )}
                  </section>
                  <section className="panel similar-panel">
                    <div className="panel-heading">
                      <h3>Similar growing conditions</h3>
                      <Leaf size={17} />
                    </div>
                    {similarCrops.map((crop, index) => (
                      <button
                        className="similar-crop"
                        key={crop.name}
                        onClick={() => setModal(crop)}
                      >
                        <span className="similar-rank">0{index + 1}</span>
                        <span>
                          <strong>{titleCase(crop.name)}</strong>
                          <small>
                            {display(crop.mean.Temperature)}°C avg ·{" "}
                            {display(crop.mean.PH)} pH avg
                          </small>
                        </span>
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                    <p className="reference-note">
                      Ranked by normalized distance to dataset averages,
                      independently of the prediction model.
                    </p>
                  </section>
                </div>
              </section>
            )}
            <footer className="page-footer">
              <span>
                <Sprout size={14} /> Agroterra · intelligence for a growing
                world
              </span>
              <span>31 crops. 9 field inputs. Better possibilities.</span>
            </footer>
          </main>
        )}
        {tab === "explore" && (
          <main className="explorer-page">
            <section className="page-heading">
              <div>
                <span className="eyebrow">KNOW WHAT YOU CAN GROW</span>
                <h1>
                  A world of <em>possibilities.</em>
                </h1>
                <p>
                  Explore {crops.length} crop profiles, built from 3,100 real
                  dataset records.
                </p>
              </div>
              <span className="library-count">
                <Leaf size={20} />
                {filteredCrops.length} crops to discover
              </span>
            </section>
            <div
              className="explorer-banner"
              style={{
                backgroundImage: `linear-gradient(90deg,rgba(22,39,28,.94),rgba(22,39,28,.3)),url(${FIELD_PHOTO})`,
              }}
            >
              <div>
                <span className="eyebrow">
                  THE RIGHT CROP BEGINS WITH THE RIGHT KNOWLEDGE
                </span>
                <h2>Every seed has its place.</h2>
                <p>
                  Understand typical soil and climate conditions before running
                  your next field analysis.
                </p>
              </div>
              <Sprout size={68} />
            </div>
            <div className="explorer-toolbar">
              <label className="crop-search">
                <Search size={18} />
                <input
                  aria-label="Search crops"
                  placeholder="Search crops, from rice to rubber…"
                  value={cropQuery}
                  onChange={(event) => setCropQuery(event.target.value)}
                />
              </label>
              <label className="filter-select">
                <Layers size={16} />
                <select
                  value={soilFilter}
                  aria-label="Filter crops by soil"
                  onChange={(event) => setSoilFilter(event.target.value)}
                >
                  <option>All soils</option>
                  {SOILS.map((soil) => (
                    <option key={soil}>{soil}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </label>
              <span>{filteredCrops.length} results</span>
            </div>
            <div className="crop-library">
              {filteredCrops.map((crop, index) => (
                <button
                  className="crop-card panel"
                  key={crop.name}
                  onClick={() => setModal(crop)}
                >
                  <div className={`crop-card-art crop-tone-${index % 4}`}>
                    <Sprout size={54} />
                    <span>{crop.count} DATASET RECORDS</span>
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="crop-card-content">
                    <span className="eyebrow">{crop.soils.join(" · ")}</span>
                    <h3>{titleCase(crop.name)}</h3>
                    <div>
                      <span>
                        <Thermometer size={14} />
                        {display(crop.mean.Temperature)}°C
                      </span>
                      <span>
                        <Droplets size={14} />
                        {display(crop.mean.Humidity)}%
                      </span>
                      <span>pH {display(crop.mean.PH)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {filteredCrops.length === 0 && (
              <div className="empty-state">
                <Search size={35} />
                <h2>No crops found</h2>
                <p>Try another crop name or soil filter.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setCropQuery("");
                    setSoilFilter("All soils");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
            <p className="library-disclaimer">
              Profiles describe dataset averages and ranges. Your field’s model
              recommendation is calculated separately.
            </p>
          </main>
        )}
        {tab === "reports" && (
          <main>
            <section className="page-heading">
              <div>
                <span className="eyebrow">YOUR FIELD’S STORY, SAVED</span>
                <h1>
                  Good decisions <em>grow here.</em>
                </h1>
                <p>
                  Revisit, compare, and export your crop analyses. Saved locally
                  in this browser.
                </p>
              </div>
              <span className="library-count">
                <Bookmark size={19} />
                {reports.length} saved analyses
              </span>
            </section>
            {reports.length === 0 ? (
              <div className="empty-state reports-empty">
                <div className="empty-icon">
                  <Bookmark size={36} />
                </div>
                <h2>Your first insight is waiting.</h2>
                <p>
                  Run an analysis, then use the bookmark button to keep it here.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setTab("overview")}
                >
                  Analyse my field <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="report-list">
                {reports.map((report) => (
                  <article className="panel report-card" key={report.id}>
                    <div className="report-crop-icon">
                      <Sprout size={29} />
                    </div>
                    <div className="report-title">
                      <span className="eyebrow">MODEL RECOMMENDATION</span>
                      <h2>{titleCase(report.crop)}</h2>
                      <p>
                        <MapPin size={13} />
                        {report.location.name} ·{" "}
                        {new Date(report.timestamp).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="report-values">
                      <span>{display(report.inputs.Temperature)}°C</span>
                      <span>{display(report.inputs.Humidity)}% RH</span>
                      <span>pH {display(report.inputs.PH)}</span>
                      <small>{report.inputs.Soil}</small>
                    </div>
                    <div className="report-actions">
                      <button
                        className="secondary-button"
                        onClick={() => restoreReport(report)}
                      >
                        Open analysis <ArrowUpRight size={15} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => exportReport(report)}
                        aria-label={`Export ${report.crop} report`}
                      >
                        <ArrowDownToLine size={18} />
                      </button>
                      <button
                        className="icon-button delete-button"
                        onClick={() => {
                          if (
                            saveReports(
                              reports.filter((item) => item.id !== report.id),
                            )
                          )
                            setToast("Saved analysis removed.");
                        }}
                        aria-label={`Delete ${report.crop} report`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal === "map" && (
        <Modal
          title="Find your place to grow"
          wide
          onClose={() => setModal(null)}
        >
          <div className="expanded-map">
            <FieldMap
              location={location}
              onSelect={selectLocation}
              satellite={satellite}
            />
          </div>
          <div className="expanded-map-footer">
            <span>
              <MapPin size={15} />
              {location.name} · {location.lat.toFixed(4)},{" "}
              {location.lon.toFixed(4)}
            </span>
            <button
              className="secondary-button"
              onClick={() => setSatellite(!satellite)}
            >
              <Layers size={15} />
              {satellite ? "Street map" : "Satellite map"}
            </button>
            <button
              className="primary-button"
              onClick={useGPS}
              disabled={gpsBusy}
            >
              <LocateFixed size={16} />
              {gpsBusy ? "Locating…" : "Use GPS"}
            </button>
          </div>
          <p className="reference-note">
            Click a point to select it. The marker is a location, not a surveyed
            field boundary.
          </p>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="From your field to a smarter choice"
          onClose={() => setModal(null)}
        >
          <div className="help-steps">
            {[
              [
                MapPin,
                "Locate your land",
                "Use GPS, city search, or click the map. Live weather follows the selected location.",
              ],
              [
                SlidersHorizontal,
                "Understand your conditions",
                "Edit the climate dials and nutrient inputs. Use live weather for current temperature and humidity. Enter rainfall for the period relevant to your field; the daily forecast is separate.",
              ],
              [
                Sprout,
                "Discover your crop",
                "Run the trained model with all nine inputs. Explore dataset profiles, save your analysis, and export a report.",
              ],
            ].map(([Icon, title, text], index) => (
              <div key={title}>
                <span className="help-step-icon">
                  <Icon size={22} />
                </span>
                <div>
                  <small>0{index + 1}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="help-note">
            <FlaskConical size={22} />
            <p>
              Demo scenarios are real rows from the project dataset. Weather
              comes from{" "}
              <a
                href="https://open-meteo.com/en/docs"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </a>
              . Soil and nutrient measurements need to be entered by you. Carbon
              uses the dataset’s content scale. No model confidence, yield
              prediction, or automatic soil sensing is claimed.
            </p>
          </div>
          <button
            className="primary-button full-width"
            onClick={() => setModal(null)}
          >
            Let’s grow something <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {modal && typeof modal === "object" && (
        <Modal title={titleCase(modal.name)} onClose={() => setModal(null)}>
          <div
            className="crop-detail-hero"
            style={{
              backgroundImage: `linear-gradient(90deg,rgba(22,39,28,.93),rgba(22,39,28,.25)),url(${WHEAT_PHOTO})`,
            }}
          >
            <Sprout size={42} />
            <div>
              <span className="eyebrow">DATASET CROP PROFILE</span>
              <strong>{modal.count} reference records</strong>
              <p>{modal.soils.join(" · ")}</p>
            </div>
          </div>
          <p className="detail-intro">
            A look at the conditions recorded for {titleCase(modal.name)} in the
            project dataset.
          </p>
          <div className="crop-details">
            {FEATURES.map((feature) => (
              <div key={feature.key}>
                <span>{feature.label}</span>
                <strong>
                  {display(modal.mean[feature.key], 2)}{" "}
                  <small>{feature.unit}</small>
                </strong>
                <small>
                  Range: {display(modal.ranges[feature.key][0])}–
                  {display(modal.ranges[feature.key][1])}
                </small>
              </div>
            ))}
          </div>
          <p className="reference-note">
            Dataset averages describe recorded examples; they are not
            recommended fertilizer doses or guaranteed growing limits.
          </p>
          <button
            className="primary-button full-width"
            onClick={() => {
              loadScenario(modal.name);
              setTab("overview");
              setModal(null);
            }}
          >
            Try a {titleCase(modal.name)} field scenario{" "}
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}

export default App;
