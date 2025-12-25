import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { deterministicRoomId } from '../utils/roomId';

type RoomSummary = {
  id: string;
  members: string[];
  lastMessage?: string;
  updatedAt?: any;
};

export default function ChatList({ currentUid }: { currentUid: string }) {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('members', 'array-contains', currentUid), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setRooms(data);
    });
    return () => unsub();
  }, [currentUid]);

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Chats</div>
      <div className="space-y-2">
        {rooms.length === 0 && <div className="text-sm text-slate-400">No recent chats</div>}
        {rooms.map((r) => {
          const peer = r.members.find((m: string) => m !== currentUid);
          return (
            <div key={r.id} className="p-3 rounded-bento bg-whispr-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{peer?.slice(0, 8) ?? 'Unknown'}</div>
                <div className="text-xs text-slate-500">{r.lastMessage ?? '—'}</div>
              </div>
              <div className="text-xs text-slate-400">{/* time placeholder */}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}