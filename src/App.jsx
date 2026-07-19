import React from 'react'
import Weather from './Components/Weather'
import weatherBg from './assets/weather.jpg'

function App() {
  return (
    <div 
      className='min-h-screen w-full flex items-center justify-center bg-cover bg-center relative bg-slate-900'
      style={{ backgroundImage: `url(${weatherBg})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div className="relative z-10 w-full px-4 flex justify-center items-center">
        <Weather />
      </div>
    </div>
  )
}

export default App
