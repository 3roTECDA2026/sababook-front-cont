import React from 'react';

export const ReadingStreak = ({ rachaActual = 3, recordRacha = 7 }) => {
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm">Racha de Lectura</h3>
        <span className="text-xl" role="img" aria-label="fuego">🔥</span>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-extrabold text-orange-500">{rachaActual}</span>
        <span className="text-gray-500 text-xs font-medium">días consecutivos</span>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Récord histórico: <strong className="text-gray-600">{recordRacha} días</strong>
      </p>

      {/* Indicadores de días de la semana */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        {diasSemana.map((dia, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-semibold">{dia}</span>
            <div 
              className={`w-3 h-3 rounded-full ${
                index < rachaActual ? 'bg-orange-500 shadow-sm' : 'bg-gray-200'
              }`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadingStreak;
