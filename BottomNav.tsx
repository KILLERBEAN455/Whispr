import React from 'react';
import { Home, MessageSquare, PlusSquare, Circle } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bg-white border-t px-4 py-2 flex justify-between">
      <button className="flex flex-col items-center text-slate-600">
        <Home size={20} />
        <span className="text-xs">Home</span>
      </button>
      <button className="flex flex-col items-center text-slate-600">
        <MessageSquare size={20} />
        <span className="text-xs">Chats</span>
      </button>
      <button className="flex flex-col items-center text-slate-600">
        <PlusSquare size={20} />
        <span className="text-xs">Post</span>
      </button>
      <button className="flex flex-col items-center text-slate-600">
        <Circle size={20} />
        <span className="text-xs">Profile</span>
      </button>
    </nav>
  );
}