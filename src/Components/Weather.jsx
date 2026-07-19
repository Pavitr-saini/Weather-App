import React, { useState, useEffect } from 'react'

function Weather() {
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

  const saveRecentSearch = (city) => {
    setRecentSearches(prev => {
      const updated = [city, ...prev.filter(s => s !== city)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }
  
  const handleChange = (e) => {
    setSearch(e.target.value)
    setError(null)
  }
  
  // const API_Key ="458d5a04fd73a9ae05df0b44edd2c4e4"
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
    const celsius = tempInKelvin - 273.15;
    return unit === 'C' ? Math.round(celsius) : Math.round((celsius * 9/5) + 32);
  }
  
  return (
    <div className='w-full max-w-[28rem] relative bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 rounded-[2.5rem] text-center text-white overflow-hidden font-sans transition-all duration-500 mx-auto'>
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col w-full relative z-10">
        
        {/* Search Bar Container */}
        <div className="relative flex items-center bg-white/10 rounded-full p-1.5 mb-2 border border-white/20 shadow-inner group focus-within:bg-white/20 transition-all duration-300 w-full">
          <button
            className='h-10 w-10 shrink-0 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white/80 hover:text-white'
            onClick={fetchWeatherByLocation}
            title="Use Current Location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <input 
            className='flex-1 bg-transparent px-3 text-white placeholder-white/60 outline-none text-base font-medium tracking-wide w-full' 
            type="text" 
            placeholder='Search city...' 
            value={search} 
            onChange={handleChange} 
            onKeyDown={handleKeyDown}
          />
          
          <button 
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-white text-gray-800 hover:bg-gray-100 transition-all shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
            onClick={fetchWeather}
            title="Search"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Recent Searches Header */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2 mb-4">
            {recentSearches.map((city, idx) => (
              <button 
                key={idx} 
                onClick={() => fetchWeather(city)}
                className="bg-black/20 hover:bg-black/30 text-white/90 text-[11px] sm:text-xs px-3 py-1 rounded-full border border-white/10 transition-all duration-300 tracking-wider uppercase font-semibold shadow-sm hover:shadow"
              >
                {city}
              </button>
            ))}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-2 animate-fadeIn shadow-lg">
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
      
      {data ? (
        <div className="flex flex-col items-center mt-6 animate-fadeIn relative z-10 w-full">
          {/* Weather Icon & Main Info */}
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-110 pointer-events-none"></div>
            <img 
              className='relative w-36 h-36 drop-shadow-2xl z-10 select-none scale-110' 
              src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`} 
              alt="Weather Icon" 
              draggable="false"
            />
          </div>
          
          <h1 
            className='text-7xl font-extrabold tracking-tighter drop-shadow-lg text-white mb-2 cursor-pointer hover:scale-105 transition-transform duration-300 flex items-start'
            onClick={toggleUnit}
            title="Click to toggle °C/°F"
          >
            {getTemperature(data.main.temp)}<span className="text-3xl font-medium mt-1 ml-1 text-white/80">°{unit}</span>
          </h1>
          
          <div className="flex items-center gap-2 mb-1">
            <p className='text-3xl font-bold tracking-wide drop-shadow-md'>{data.name}</p>
            <div className="h-6 w-[2px] bg-white/30 rounded-full mx-1"></div>
            <p className='text-xl text-white/90 font-light tracking-wide capitalize drop-shadow'>{data.weather[0].description}</p>
          </div>

          <p className="text-white/70 text-sm font-medium tracking-wide mb-8">
            Feels like {getTemperature(data.main.feels_like)}°{unit}
          </p>

          {/* Details Grid */}
          <div className='w-full grid grid-cols-2 gap-4'>
            {/* Humidity Card */}
            <div className='flex items-center gap-4 bg-black/20 hover:bg-black/30 backdrop-blur-md transition-all duration-300 p-4 rounded-3xl border border-white/10 shadow-lg group'>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5C16.1421 21.5 19.5 18.1421 19.5 14C19.5 9 12 2.5 12 2.5C12 2.5 4.5 9 4.5 14C4.5 18.1421 7.85786 21.5 12 21.5Z" />
                </svg>
              </div>
              <div className='text-left'>
                <p className='text-xs text-white/60 font-medium uppercase tracking-widest mb-0.5'>Humidity</p>
                <p className='text-xl font-bold text-white drop-shadow-sm leading-tight'>{data.main.humidity}%</p>
              </div>
            </div>

            {/* Wind Card */}
            <div className='flex items-center gap-4 bg-black/20 hover:bg-black/30 backdrop-blur-md transition-all duration-300 p-4 rounded-3xl border border-white/10 shadow-lg group'>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gray-400/20 group-hover:scale-110 transition-all border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-200">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                </svg>
              </div>
              <div className='text-left'>
                <p className='text-xs text-white/60 font-medium uppercase tracking-widest mb-0.5'>Wind</p>
                <p className='text-xl font-bold text-white drop-shadow-sm leading-tight'>{Math.round(data.wind.speed)} <span className="text-sm font-medium">km/h</span></p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-16 text-center w-full animate-fadeIn'>
          <div className="w-24 h-24 mb-6 opacity-40 bg-white/10 rounded-full flex items-center justify-center shadow-inner border border-white/20 hover:opacity-100 transition-opacity duration-500 cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-wide mb-2 text-white/90">Weather Forecast</h2>
          <p className="text-sm text-white/60 font-medium max-w-[220px] leading-relaxed mx-auto">
            Search for a city or use your location to see the weather.
          </p>
        </div>
      )}
    </div>
  )
}

export default Weather