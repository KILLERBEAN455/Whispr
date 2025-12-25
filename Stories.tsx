import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function expiresAt24h() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export default function Stories({ currentUid }: { currentUid: string }) {
  const [stories, setStories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    // show stories that haven't expired (note: client-side filter; server-side TTL/cleaner recommended)
    const q = query(collection(db, 'stories'));
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const data = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((s) => {
          if (!s.expiresAt) return false;
          const expires = s.expiresAt?.toMillis?.() ?? new Date(s.expiresAt).getTime();
          return expires > now;
        });
      setStories(data);
    });
    return () => unsub();
  }, []);

  async function upload() {
    if (!text.trim()) return;
    setUploading(true);
    await addDoc(collection(db, 'stories'), {
      uid: currentUid,
      content: text.trim(),
      createdAt: serverTimestamp(),
      expiresAt: expiresAt24h()
    });
    setText('');
    setUploading(false);
  }

  return (
    <div className="bg-white rounded-bento p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Stories</div>
        <div className="text-xs text-slate-400">24h</div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Upload card */}
        <div className="min-w-[160px] p-3 rounded-bento bg-whispr-50 flex-shrink-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share ephemeral status"
            className="w-full p-2 border rounded-md"
            rows={3}
          />
          <button onClick={upload} disabled={uploading} className="mt-2 px-3 py-2 rounded-md bg-whispr-500 text-white">
            {uploading ? 'Posting...' : 'Post Story'}
          </button>
        </div>

        {/* Stories */}
        {stories.map((s) => (
          <div key={s.id} className="min-w-[160px] p-3 rounded-bento bg-slate-50 flex-shrink-0">
            <div className="text-xs font-mono text-slate-600">{s.uid.slice(0, 8)}…</div>
            <div className="mt-2 text-sm">{s.content}</div>
            <div className="text-xs text-slate-400 mt-2">{/* time left calculation optional */}</div>
          </div>
        ))}
      </div>
    </div>
  );
}