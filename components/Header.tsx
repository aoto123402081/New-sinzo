
import React from 'react';
import { Room } from '../types';

interface HeaderProps {
  onlineCount: number;
  onlineUsers: string[];
  onAdmin: () => void;
  onShowOnline: () => void;
  currentRoom: string;
  rooms: Room[];
}

const Header: React.FC<HeaderProps> = ({ onlineCount, onlineUsers, onAdmin, onShowOnline, currentRoom, rooms }) => {
  const mainRooms = [
    { id: 'threads', label: '通常', icon: '🏠' },
    { id: 'chat', label: '雑談', icon: '💬' },
    { id: 'apple', label: 'apple製品', icon: '' },
    { id: 'question', label: '質問', icon: '🙋' }
  ];

  const currentRoomInfo = mainRooms.find(r => r.id === currentRoom) || 
                          rooms.find(r => r.id === currentRoom);

  const roomLabel = currentRoomInfo && 'label' in currentRoomInfo ? currentRoomInfo.label : currentRoom;
  const roomIcon = currentRoomInfo && 'icon' in currentRoomInfo ? currentRoomInfo.icon : '🚪';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
            B
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Bord</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              sinzo-bord
            </div>
          </div>
        </a>
        <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span className="text-sm">{roomIcon}</span>
          <span className="text-sm font-bold text-slate-700">{roomLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onShowOnline}
          className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-emerald-100 transition-colors"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {onlineCount}人
        </button>
        <button 
          onClick={onAdmin}
          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          管理者
        </button>
      </div>
    </header>
  );
};

export default Header;
