import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';
import { deterministicRoomId } from '../utils/roomId';

export default function ChatWindow({ currentUid }: { currentUid: string }) {
  // Simple state: choose a peer to chat with by entering their ID
  const [peerId, setPeerId] = useState<string>('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      // auto-scroll
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [roomId]);

  async function startChat() {
    if (!peerId) return alert('Enter a peer ID to chat with');
    const rId = deterministicRoomId(currentUid, peerId);
    setRoomId(rId);
    // ensure room doc exists
    const roomRef = doc(db, 'rooms', rId);
    await setDoc(
      roomRef,
      {
        members: [currentUid, peerId],
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  async function sendMessage() {
    if (!roomId || text.trim().length === 0) return;
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUid,
      text: text.trim(),
      createdAt: serverTimestamp()
    });
    // update room lastMessage & updatedAt
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { lastMessage: text.trim(), updatedAt: serverTimestamp() }).catch(() => {});
    setText('');
  }

  return (
    <div className="bg-white rounded-bento p-4 shadow-sm">
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Peer User ID (paste here)"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button onClick={startChat} className="px-4 py-2 rounded-md bg-whispr-500 text-white">
          Start
        </button>
      </div>

      {!roomId ? (
        <div className="text-sm text-slate-400">No active conversation. Start by entering a peer ID.</div>
      ) : (
        <div className="flex flex-col h-[60vh]">
          <div ref={listRef} className="flex-1 overflow-auto space-y-3 p-2">
            {messages.map((m) => (
              <div key={m.id} className={`message-bubble p-3 rounded-xl ${m.senderId === currentUid ? 'bg-whispr-100 self-end' : 'bg-slate-100 self-start'}`}>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-slate-400 mt-1">{/* timestamp if available */}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say something..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button onClick={sendMessage} className="px-4 py-2 rounded-md bg-whispr-500 text-white">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}