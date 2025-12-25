import React from 'react';
import { Copy, MessageCircle, Settings, Users } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Sidebar({ uid }: { uid: string }) {
  async function copyId() {
    await navigator.clipboard.writeText(uid);
    // update lastSeen locally in Firestore user doc
    const uRef = doc(db, 'users', uid);
    await setDoc(uRef, { lastSeen: serverTimestamp() }, { merge: true });
    alert('User ID copied to clipboard');
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-whispr-600">Whispr</h1>
          <p className="text-sm text-slate-500">Instant • Private • Ephemeral</p>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-xs text-slate-400">Your ID</div>
          <div className="text-sm font-mono text-slate-700">{uid.slice(0, 8)}…</div>
        </div>
      </div>

      <div className="bg-white rounded-bento p-4 shadow-sm space-y-3">
        <button
          onClick={copyId}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-whispr-100 text-whispr-700 hover:bg-whispr-200"
        >
          <Copy size={16} /> Copy ID
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
          <Users size={16} /> Contacts
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
          <MessageCircle size={16} /> Messages
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
          <Settings size={16} /> Settings
        </button>
      </div>
    </div>
  );
}