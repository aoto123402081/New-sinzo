
import React, { useState } from 'react';
import { Room } from '../types';

interface RoomSelectorProps {
  currentRoom: string;
  onSwitch: (room: string) => void;
  onAddRoom: () => void;
  rooms: Room[];
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ currentRoom, onSwitch, onAddRoom, rooms }) => {
  const [showAll, setShowAll] = useState(false);
  const mainRooms = [
    { id: 'threads', label: '🏠 通常' },
    { id: 'chat', label: '💬 雑談' },
    { id: 'apple', label: ' apple製品' },
    { id: 'question', label: '🙋 質問' }
  ];

  const otherRooms = rooms.filter(r => !mainRooms.map(m => m.id).includes(r.id));

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        {mainRooms.map(room => (
          <button
            key={room.id}
            onClick={() => onSwitch(room.id)}
            className={`roomBtn rounded-full text-sm font-bold transform active:scale-95 ${
              currentRoom === room.id ? 'active' : ''
            }`}
          >
            {room.label}
          </button>
        ))}
        
        <div className="relative">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`roomBtn rounded-full text-sm font-bold transition-all ${
              showAll ? 'bg-slate-800 text-white' : ''
            }`}
          >
            🚪 その他 {otherRooms.length > 0 && `(${otherRooms.length})`}
          </button>

          {showAll && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
              {otherRooms.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">部屋がありません</div>
              ) : (
                otherRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => { onSwitch(room.id); setShowAll(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${currentRoom === room.id ? 'font-bold text-blue-500 bg-blue-50' : 'text-slate-700'}`}
                  >
                    {room.icon ? <img src={room.icon} className="w-4 h-4 rounded-sm object-cover" alt="" /> : <span>🚪</span>}
                    <span className="truncate">#{room.id}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={onAddRoom}
          className="roomBtn bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-sm font-bold flex items-center gap-1"
        >
          <span>＋</span> 部屋作成
        </button>
      </div>
    </div>
  );
};

export default RoomSelector;
