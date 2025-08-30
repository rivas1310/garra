'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Fecha de inauguración: 1 de septiembre de 2025
    const targetDate = new Date('2025-09-01T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        // La fecha ya pasó
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calcular inicialmente
    calculateTimeLeft();
    
    // Actualizar cada segundo
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(timer);
  }, []);

  // Función para agregar ceros a la izquierda si es necesario
  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : num.toString();
  };

  return (
    <div className="w-full py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">¡Gran Inauguración!</h2>
        <p className="text-xl md:text-2xl mb-8">1 de Septiembre de 2025</p>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <div className="w-20 md:w-32 p-3 md:p-6 bg-black bg-opacity-30 rounded-lg">
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">{formatNumber(timeLeft.days)}</div>
            <div className="text-sm md:text-base mt-2">Días</div>
          </div>
          
          <div className="w-20 md:w-32 p-3 md:p-6 bg-black bg-opacity-30 rounded-lg">
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">{formatNumber(timeLeft.hours)}</div>
            <div className="text-sm md:text-base mt-2">Horas</div>
          </div>
          
          <div className="w-20 md:w-32 p-3 md:p-6 bg-black bg-opacity-30 rounded-lg">
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">{formatNumber(timeLeft.minutes)}</div>
            <div className="text-sm md:text-base mt-2">Minutos</div>
          </div>
          
          <div className="w-20 md:w-32 p-3 md:p-6 bg-black bg-opacity-30 rounded-lg">
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold">{formatNumber(timeLeft.seconds)}</div>
            <div className="text-sm md:text-base mt-2">Segundos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;