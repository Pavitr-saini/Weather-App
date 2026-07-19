import React, { useState } from 'react'
import Weather from './Components/Weather'
import weatherBg from './assets/weather.jpg'

function App() {
  const [condition, setCondition] = useState(null);

  // Dynamic style mapper based on weather condition
  const getThemeClasses = (weather) => {
    if (!weather) return 'from-indigo-950/80 via-slate-900/90 to-zinc-950';
    
    switch (weather.toLowerCase()) {
      case 'clear':
        return 'from-amber-600/25 via-sky-950/90 to-slate-950';
      case 'clouds':
        return 'from-slate-700/40 via-blue-950/80 to-zinc-950';
      case 'rain':
      case 'drizzle':
        return 'from-blue-950/65 via-slate-900/90 to-zinc-950';
      case 'thunderstorm':
        return 'from-purple-950/60 via-slate-950/90 to-zinc-950';
      case 'snow':
        return 'from-sky-900/35 via-slate-800/80 to-blue-950';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
      case 'sand':
      case 'ash':
      case 'squall':
      case 'tornado':
        return 'from-teal-900/30 via-slate-900/90 to-zinc-950';
      default:
        return 'from-indigo-950/80 via-slate-900/90 to-zinc-950';
    }
  };

  const getGlowClasses = (weather) => {
    if (!weather) return 'bg-indigo-500/20';
    switch (weather.toLowerCase()) {
      case 'clear':
        return 'bg-amber-400/25';
      case 'clouds':
        return 'bg-slate-400/20';
      case 'rain':
      case 'drizzle':
        return 'bg-blue-400/20';
      case 'thunderstorm':
        return 'bg-purple-500/20';
      case 'snow':
        return 'bg-cyan-200/20';
      default:
        return 'bg-indigo-500/20';
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative bg-slate-950 font-sans select-none overflow-y-auto py-10 px-4 transition-all duration-1000"
      style={{ backgroundImage: `url(${weatherBg})` }}
    >
      {/* Dynamic Ambient Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeClasses(condition)} transition-all duration-1000 z-0`}></div>
      
      {/* Premium Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] ${getGlowClasses(condition)} animate-pulseGlow transition-all duration-1000`}></div>
        <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] ${getGlowClasses(condition)} animate-pulseGlowSlow transition-all duration-1000`}></div>
      </div>

      <div className="relative z-10 w-full flex justify-center items-center">
        <Weather onWeatherChange={setCondition} />
      </div>
    </div>
  )
}

export default App
