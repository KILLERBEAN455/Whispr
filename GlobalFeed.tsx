import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function GlobalFeed({ currentUid }: { currentUid: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'globalFeed'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  async function post() {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > 280) return alert('Max 280 characters');
    await addDoc(collection(db, 'globalFeed'), {
      uid: currentUid,
      text: trimmed,
      createdAt: serverTimestamp()
    });
    setText('');
  }

  return (
    <div className="bg-white rounded-bento p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a thought (public, 280 chars)"
          className="flex-1 p-3 border rounded-md"
          rows={2}
        />
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-400">{text.length}/280</div>
          <button onClick={post} className="px-3 py-2 rounded-md bg-whispr-500 text-white">
            Post
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="p-3 rounded-bento bg-whispr-50">
            <div className="text-sm font-mono text-slate-700">{p.uid.slice(0, 8)}…</div>
            <div className="mt-1 text-sm">{p.text}</div>
            <div className="text-xs text-slate-400 mt-2">{/* time */}</div>
          </div>
        ))}
      </div>
    </div>
  );
}