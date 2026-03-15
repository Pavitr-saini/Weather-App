import React, { useState } from 'react'

function Weather() {
  const [search, setSearch] = useState("")
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  
  const handleChange = (e) => {
    setSearch(e.target.value)
    setError(null)
  }
  
  const API_Key ="458d5a04fd73a9ae05df0b44edd2c4e4"
  
  const fetchWeather = async () => {
    if (search === "") {
      setError("Please enter a city name")
      setData(null)
      return
    }
    
    try {
      setError(null)
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_Key}`);
      const jsonData = await response.json();
      console.log(jsonData);
      
      if(jsonData.cod === "404" || jsonData.cod === "400"){
        setError("City not found")
        setData(null)
      } else {
        setData(jsonData)
      }
      setSearch("")
    } catch (err) {
      setError("Failed to fetch weather data")
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  }
  
  return (
    <div className='w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6 sm:p-10 rounded-3xl text-center text-white transition-all duration-300 mx-auto'>
      <div className="flex flex-col w-full">
        <div className="flex justify-center items-center gap-2 sm:gap-3 w-full">
          <input 
            className='flex-1 bg-white/20 text-white placeholder-gray-100 outline-none rounded-full py-3 px-5 sm:px-6 text-base sm:text-lg tracking-wide border border-white/10 focus:bg-white/30 transition-all duration-300 shadow-inner' 
            type="text" 
            placeholder='Enter City or Country' 
            value={search} 
            onChange={handleChange} 
            onKeyDown={handleKeyDown}
          />
          <button 
            className='cursor-pointer bg-white/20 hover:bg-white/40 transition-all duration-300 h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border border-white/10 shadow-lg shrink-0' 
            onClick={fetchWeather}
            title="Search"
          >
            <img src="/src/assets/search.png" alt="Search" className="w-5 h-5 sm:w-6 sm:h-6 object-contain invert" />
          </button>
        </div>
        {error && <p className="text-red-400 text-sm sm:text-base mt-3 ml-4 text-left animate-fadeIn font-medium drop-shadow-md">{error}</p>}
      </div>
      
      {data ? (
        <div className="flex flex-col justify-center items-center mt-8 gap-2 sm:gap-4 animate-fadeIn">
          <div className="relative">
            {/* Soft glowing background behind weather icon */}
            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-75"></div>
            <img 
              className='relative w-28 h-28 sm:w-36 sm:h-36 drop-shadow-xl z-10' 
              src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`} 
              alt="Weather Icon" 
            />
          </div>
          
          <h1 className='text-5xl sm:text-7xl font-bold tracking-tighter drop-shadow-md text-white mt-2'>
            {Math.round(data.main.temp - 273.15)}°<span className="text-3xl sm:text-5xl font-normal">C</span>
          </h1>
          
          <p className='text-lg sm:text-xl font-medium tracking-wide capitalize text-gray-50 drop-shadow'>{data.weather[0].description}</p>
          <p className='text-2xl sm:text-3xl font-semibold mt-1 drop-shadow-md'>{data.name}</p>

          <div className='w-full grid grid-cols-2 gap-4 mt-8 sm:mt-10'>
            <div className='flex items-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/15 transition-colors p-3 sm:p-4 rounded-2xl border border-white/5 shadow-md'>
              <img src="/src/assets/humidity.png" alt="Humidity" className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <div className='text-left'>
                <p className='text-lg sm:text-xl font-bold'>{data.main.humidity}%</p>
                <span className='text-xs sm:text-sm text-gray-200 font-medium'>Humidity</span>
              </div>
            </div>

            <div className='flex items-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/15 transition-colors p-3 sm:p-4 rounded-2xl border border-white/5 shadow-md'>
              <img src="/src/assets/wind.png" alt="Wind Speed" className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <div className='text-left'>
                <p className='text-lg sm:text-xl font-bold'>{Math.round(data.wind.speed)} km/h</p>
                <span className='text-xs sm:text-sm text-gray-200 font-medium'>Wind</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='mt-16 mb-8 py-10 text-xl sm:text-2xl font-medium text-white/80 animate-pulse tracking-wide font-light'>
          Discover the weather
        </div>
      )}
    </div>
  )
}

export default Weather