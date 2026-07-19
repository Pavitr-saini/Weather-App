import React, { useState, useEffect } from 'react'

function Weather({ onWeatherChange }) {
  const [search, setSearch] = useState("")
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [unit, setUnit] = useState('C')
  const [recentSearches, setRecentSearches] = useState([])
  
  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches'));
    if (savedSearches) setRecentSearches(savedSearches);
  }, []);

  // Update background theme in parent App.jsx when weather data changes
  useEffect(() => {
    if (data && data.weather && data.weather[0]) {
      onWeatherChange(data.weather[0].main);
    } else {
      onWeatherChange(null);
    }
  }, [data, onWeatherChange]);

  const saveRecentSearch = (city) => {
    setRecentSearches(prev => {
      const updated = [city, ...prev.filter(s => s !== city)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }
  
  const handleChange = (e) => {
    setSearch(e.target.value)
    setError(null)
  }
  
  const apiKey = import.meta.env.VITE_API_KEY;
  
  const fetchWeather = async (cityQuery) => {
    const finalQuery = typeof cityQuery === 'string' ? cityQuery : search;
    if (!finalQuery) {
      setError("Please enter a city name")
      setData(null)
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${finalQuery}&appid=${apiKey}`);
      const jsonData = await response.json();
      
      if(jsonData.cod === "404" || jsonData.cod === "400"){
        setError("City not found")
        setData(null)
      } else {
        setData(jsonData)
        saveRecentSearch(jsonData.name)
      }
      if (typeof cityQuery !== 'string') {
        setSearch("")
      }
    } catch (err) {
      setError("Failed to fetch weather data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherByLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          setError(null);
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}`);
          const jsonData = await response.json();
          if(jsonData.cod === "404" || jsonData.cod === "400"){
            setError("Location not found");
            setData(null);
          } else {
            setData(jsonData);
            saveRecentSearch(jsonData.name)
          }
        } catch (err) {
          setError("Failed to fetch weather data");
        } finally {
          setIsLoading(false);
        }
      }, () => {
        setError("Geolocation permission denied.");
        setIsLoading(false);
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  }

  const toggleUnit = () => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  }

  const getTemperature = (tempInKelvin) => {
    if (tempInKelvin === undefined || tempInKelvin === null) return 0;
    const celsius = tempInKelvin - 273.15;
    return unit === 'C' ? Math.round(celsius) : Math.round((celsius * 9/5) + 32);
  }

  const formatTime = (timestamp, timezoneOffset = 0) => {
    if (!timestamp) return "";
    // convert UTC seconds to local time of the target city
    const utcDate = new Date(timestamp * 1000);
    const localDate = new Date(utcDate.getTime() + (timezoneOffset * 1000));
    
    // Since we manually shifted it, format it using UTC getters to prevent double offset
    const hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl glass-card p-6 sm:p-8 rounded-[2.5rem] mx-auto animate-pulse text-white/50">
        <div className="h-12 bg-white/10 rounded-full mb-6 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-6">
          <div className="md:col-span-2 flex flex-col items-center justify-center py-6 border-b md:border-b-0 md:border-r border-white/10">
            <div className="w-32 h-32 bg-white/10 rounded-full mb-4"></div>
            <div className="h-12 bg-white/10 rounded-xl mb-4 w-24"></div>
            <div className="h-8 bg-white/10 rounded-lg mb-2 w-40"></div>
            <div className="h-4 bg-white/10 rounded-lg w-28"></div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl p-4 border border-white/5"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-3xl relative glass-card p-6 sm:p-8 rounded-[2.5rem] text-center text-white overflow-hidden transition-all duration-500 mx-auto animate-fadeIn'>
      {/* Decorative background glows inside card */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulseGlowSlow"></div>
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulseGlow"></div>

      <div className="flex flex-col w-full relative z-10">
        {/* Search Bar Container */}
        <div className="relative flex items-center glass-input rounded-full p-1.5 border border-white/10 shadow-lg focus-within:border-white/20 transition-all duration-300 w-full mb-3">
          <button
            className='h-10 w-10 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/70 hover:text-white'
            onClick={fetchWeatherByLocation}
            title="Use Current Location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <input 
            className='flex-1 bg-transparent px-3 text-white placeholder-white/40 outline-none text-base font-medium tracking-wide w-full' 
            type="text" 
            placeholder='Search city...' 
            value={search} 
            onChange={handleChange} 
            onKeyDown={handleKeyDown}
          />
          
          <button 
            className='h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-white text-gray-900 hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-md'
            onClick={fetchWeather}
            title="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {/* Recent Searches Container */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 animate-fadeIn">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mr-1">Recent:</span>
            {recentSearches.map((city, idx) => (
              <button 
                key={idx} 
                onClick={() => fetchWeather(city)}
                className="bg-white/5 hover:bg-white/15 text-white/80 text-[11px] px-3 py-1 rounded-full border border-white/5 transition-all duration-300 tracking-wider font-semibold shadow-sm hover:scale-105"
              >
                {city}
              </button>
            ))}
            <button 
              onClick={clearRecentSearches}
              className="text-[10px] text-red-400/80 hover:text-red-400 hover:underline px-2 py-1 font-semibold transition-all uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-2xl p-3.5 mb-4 animate-fadeIn shadow-lg">
            <p className="text-red-300 text-sm font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
      
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-4 animate-fadeIn relative z-10 w-full text-left">
          
          {/* Main Weather Visual Info (Left Column) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-white/5 border border-white/5 relative group">
            {/* Glow backing */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

            <div className="relative mb-2 animate-float">
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-110 pointer-events-none"></div>
              <img 
                className='relative w-36 h-36 drop-shadow-[0_10px_15px_rgba(255,255,255,0.2)] z-10 select-none' 
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`} 
                alt={data.weather[0].description} 
                draggable="false"
              />
            </div>
            
            <h2 
              className='text-7xl font-black tracking-tighter drop-shadow-md text-white mb-1 cursor-pointer hover:scale-105 transition-transform duration-300 flex items-start'
              onClick={toggleUnit}
              title="Click to toggle °C/°F"
            >
              {getTemperature(data.main.temp)}<span className="text-3xl font-medium mt-1.5 ml-0.5 text-white/70">°{unit}</span>
            </h2>
            
            <p className='text-3xl font-extrabold tracking-tight drop-shadow-sm mb-1'>{data.name}</p>
            <p className='text-base text-white/80 font-medium tracking-wide capitalize drop-shadow mb-3'>{data.weather[0].description}</p>
            
            <div className="flex items-center gap-3 text-xs font-semibold text-white/60 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full shadow-inner">
              <span>H: {getTemperature(data.main.temp_max)}°</span>
              <div className="h-3 w-[1px] bg-white/20"></div>
              <span>L: {getTemperature(data.main.temp_min)}°</span>
              <div className="h-3 w-[1px] bg-white/20"></div>
              <span>Feels like {getTemperature(data.main.feels_like)}°</span>
            </div>
          </div>
          
          {/* Extended Metrics Grid (Right Column) */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Humidity */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Humidity</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5C16.1421 21.5 19.5 18.1421 19.5 14C19.5 9 12 2.5 12 2.5C12 2.5 4.5 9 4.5 14C4.5 18.1421 7.85786 21.5 12 21.5Z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-2xl font-black text-white leading-tight'>{data.main.humidity}%</p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Water vapor level</p>
              </div>
            </div>

            {/* Wind */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Wind Speed</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-2xl font-black text-white leading-tight'>{Math.round(data.wind.speed)} <span className="text-xs font-bold text-white/60">km/h</span></p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Air velocity</p>
              </div>
            </div>

            {/* Pressure */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Pressure</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-2xl font-black text-white leading-tight'>{data.main.pressure} <span className="text-xs font-bold text-white/60">hPa</span></p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Atmospheric pressure</p>
              </div>
            </div>

            {/* Visibility */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Visibility</span>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-2xl font-black text-white leading-tight'>{(data.visibility / 1000).toFixed(1)} <span className="text-xs font-bold text-white/60">km</span></p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Clear sight distance</p>
              </div>
            </div>

            {/* Sunrise */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Sunrise</span>
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-5.5l-1.5 1.5M8 16l-1.5 1.5M17 16l-1.5-1.5M8.5 7.5L7 6M12 8a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-base sm:text-lg md:text-base lg:text-lg font-black text-white leading-tight'>{formatTime(data.sys.sunrise, data.timezone)}</p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Dawn local time</p>
              </div>
            </div>

            {/* Sunset */}
            <div className='flex flex-col justify-between glass-card glass-card-hover p-4.5 rounded-2xl shadow-md'>
              <div className="flex items-center justify-between mb-3">
                <span className='text-[10px] text-white/50 font-bold uppercase tracking-wider'>Sunset</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m16 4H8a4 4 0 00-4 4h16a4 4 0 00-4-4z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className='text-base sm:text-lg md:text-base lg:text-lg font-black text-white leading-tight'>{formatTime(data.sys.sunset, data.timezone)}</p>
                <p className='text-[10px] text-white/40 mt-1 font-semibold'>Dusk local time</p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-16 text-center w-full animate-fadeIn'>
          <div className="w-24 h-24 mb-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-inner hover:scale-105 active:scale-95 transition-all duration-500 cursor-pointer animate-float relative group">
             <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-200 animate-pulse relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-wide mb-2 text-white">Weather Dashboard</h2>
          <p className="text-sm text-white/50 font-medium max-w-[280px] leading-relaxed mx-auto mb-5">
            Enter a city name above or use your current location to reveal comprehensive weather analytics.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 border border-white/5 px-4 py-1.5 rounded-full select-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure OpenWeather API Connection
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather