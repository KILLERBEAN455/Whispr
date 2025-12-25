import React from 'react';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import GlobalFeed from './components/GlobalFeed';
import Stories from './components/Stories';

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-6 rounded-bento bg-whispr-50">
          <h2 className="text-xl font-semibold">Starting Whispr...</h2>
          <p className="mt-2 text-sm text-slate-600">Creating an anonymous identity for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-80 lg:w-96 border-r p-4">
        <Sidebar uid={user.uid} />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Stories currentUid={user.uid} />
          <GlobalFeed currentUid={user.uid} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ChatList currentUid={user.uid} />
            </div>
            <div className="md:col-span-2">
              <ChatWindow currentUid={user.uid} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </footer>
    </div>
  );
}