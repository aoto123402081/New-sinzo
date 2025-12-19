
import React, { useState } from 'react';
import { db } from '../firebase.ts';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { Thread } from '../types.ts';

interface ModalProps {
  onClose: () => void;
}

const colors = [
  { value: "#3498db", label: "青" },
  { value: "#2ecc71", label: "緑" },
  { value: "#e74c3c", label: "赤" },
  { value: "#9b59b6", label: "紫" },
  { value: "#f39c12", label: "オレンジ" },
  { value: "#34495e", label: "ダーク" }
];

declare global {
  interface Window {
    processImage: (file: File, maxDim: number) => Promise<string>;
  }
}

export const CreateThreadModal: React.FC<ModalProps & { currentRoom: string, nickName: string, userIcon: string, onSuccess: (name: string, icon: string) => void }> = ({ currentRoom, nickName, userIcon, onClose, onSuccess }) => {
  const [name, setName] = useState(nickName);
  const [icon, setIcon] = useState(userIcon);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return alert("タイトルを入力してください");
    setLoading(true);
    try {
      await addDoc(collection(db, currentRoom), {
        memberId: name || '名称未設定',
        icon: icon || null,
        title,
        detail,
        password: password || null,
        color,
        image,
        postCount: 0,
        latestPostTime: serverTimestamp(),
        created_at: serverTimestamp(),
        locked: false,
        likes: 0,
        dislikes: 0
      });
      onSuccess(name, icon);
      onClose();
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">新規スレッド作成</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">ニックネーム</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="名前を入力" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">アイコン画像</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={async e => {
                  if (e.target.files?.[0]) {
                    const b64 = await window.processImage(e.target.files[0], 128);
                    setIcon(b64);
                  }
                }} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                {icon && <img src={icon} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="" />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">タイトル</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="スレッドのタイトル" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">詳細</label>
            <textarea value={detail} onChange={e => setDetail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="内容を詳しく..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">パスワード (任意)</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">背景色</label>
              <select value={color} onChange={e => setColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">画像添付</label>
            <input type="file" accept="image/*" onChange={async e => {
              if (e.target.files?.[0]) {
                const b64 = await window.processImage(e.target.files[0], 1024);
                setImage(b64);
              }
            }} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
          </div>
          
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "作成中..." : "スレッドを作成する"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreatePostModal: React.FC<ModalProps & { threadId: string, currentRoom: string, nickName: string, userIcon: string, onSuccess: (name: string, icon: string) => void }> = ({ threadId, currentRoom, nickName, userIcon, onClose, onSuccess }) => {
  const [name, setName] = useState(nickName);
  const [icon, setIcon] = useState(userIcon);
  const [body, setBody] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim() && !image) return alert("内容を入力してください");
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, currentRoom, threadId, "posts"));
      const index = snap.size + 1;

      await addDoc(collection(db, currentRoom, threadId, "posts"), {
        memberId: name || '名称未設定',
        icon: icon || null,
        body,
        image,
        color,
        index,
        created_at: serverTimestamp()
      });

      await updateDoc(doc(db, currentRoom, threadId), {
        postCount: increment(1),
        latestPostTime: serverTimestamp()
      });

      onSuccess(name, icon);
      onClose();
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">投稿する</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">ニックネーム</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="名前を入力" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">アイコン画像</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={async e => {
                  if (e.target.files?.[0]) {
                    const b64 = await window.processImage(e.target.files[0], 128);
                    setIcon(b64);
                  }
                }} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer" />
                {icon && <img src={icon} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="" />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">本文</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]" placeholder="メッセージを入力..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">背景色</label>
              <select value={color} onChange={e => setColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">画像</label>
              <input type="file" accept="image/*" onChange={async e => {
                if (e.target.files?.[0]) {
                  const b64 = await window.processImage(e.target.files[0], 1024);
                  setImage(b64);
                }
              }} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer" />
            </div>
          </div>
          
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "投稿中..." : "投稿を送信"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateRoomModal: React.FC<ModalProps> = ({ onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomId.trim()) return alert("部屋IDを入力してください");
    if (roomId.includes(' ')) return alert("部屋IDに空白は含められません");
    setLoading(true);
    try {
      await setDoc(doc(db, "rooms", roomId), {
        icon: icon || null,
        created_at: serverTimestamp()
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert("部屋の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800">新規部屋作成</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">部屋ID (アルファベット推奨)</label>
            <input 
              value={roomId} 
              onChange={e => setRoomId(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="example-room" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">部屋アイコン (任意)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={async e => {
                if (e.target.files?.[0]) {
                  const b64 = await window.processImage(e.target.files[0], 64);
                  setIcon(b64);
                }
              }} 
              className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer" 
            />
            {icon && <img src={icon} className="mt-2 w-10 h-10 rounded-lg object-cover border border-slate-200" alt="" />}
          </div>
          
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "作成中..." : "部屋を作成する"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PasswordModal: React.FC<ModalProps & { thread: Thread, onSuccess: () => void }> = ({ thread, onClose, onSuccess }) => {
  const [input, setInput] = useState('');
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-4">🔑 パスワード</h3>
        <p className="text-sm text-slate-500 mb-4">このスレッドはパスワードで保護されています</p>
        <input 
          type="password" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="パスワードを入力"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">キャンセル</button>
          <button 
            onClick={() => input === thread.password ? onSuccess() : alert("間違いです")}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold"
          >
            入室
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminModal: React.FC<ModalProps & { currentRoom: string, threads: Thread[] }> = ({ currentRoom, threads, onClose }) => {
  const [pass, setPass] = useState('');
  const [targetThread, setTargetThread] = useState('');
  const [action, setAction] = useState<'delete' | 'lock' | 'unlock'>('delete');

  const handleAction = async () => {
    if (pass !== '2059') return alert("間違いです");
    if (!targetThread) return alert("スレッドを選んでください");
    try {
      if (action === 'delete') await deleteDoc(doc(db, currentRoom, targetThread));
      else await updateDoc(doc(db, currentRoom, targetThread), { locked: action === 'lock' });
      alert("完了しました");
      onClose();
    } catch (e) {
      alert("エラー");
    }
  };

  const handleDeleteRoom = async () => {
    if (pass !== '2059') return alert("間違いです");
    const defaultRooms = ['threads', 'chat', 'apple', 'question'];
    if (defaultRooms.includes(currentRoom)) {
      return alert("基本の部屋は削除できません");
    }
    if (!confirm(`部屋「${currentRoom}」を完全に削除しますか？`)) return;
    try {
      await deleteDoc(doc(db, "rooms", currentRoom));
      alert("部屋を削除しました");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("部屋の削除中にエラーが発生しました");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-xl font-black mb-6">管理者操作</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">パスワード</label>
            <input type="password" placeholder="管理者パスワード" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          
          <div className="border-t border-slate-100 pt-4 mt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">スレッド管理</label>
            <select value={targetThread} onChange={e => setTargetThread(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none mb-2">
              <option value="">スレッドを選択</option>
              {threads.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <div className="flex gap-2">
              {(['delete', 'lock', 'unlock'] as const).map(a => (
                <button 
                  key={a} 
                  onClick={() => setAction(a)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${action === a ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {a === 'delete' ? '削除' : a === 'lock' ? 'ロック' : '解除'}
                </button>
              ))}
            </div>
            <button onClick={handleAction} className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl mt-2 hover:bg-slate-900 transition-colors">スレッド操作を実行</button>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">部屋管理</label>
            <button onClick={handleDeleteRoom} className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              🗑️ この部屋を削除
            </button>
            <p className="text-[10px] text-slate-400 mt-1 text-center">※基本の部屋は削除できません</p>
          </div>

          <button onClick={onClose} className="w-full font-bold text-slate-400 py-2 hover:text-slate-600">閉じる</button>
        </div>
      </div>
    </div>
  );
};

export const ImageModal: React.FC<{ src: string, onClose: () => void }> = ({ src, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <img src={src} className="max-w-full max-h-full rounded-lg shadow-2xl animate-in fade-in zoom-in-95" alt="" />
      <button className="absolute top-6 right-6 text-white text-4xl">&times;</button>
    </div>
  );
};

export const OnlineUsersModal: React.FC<ModalProps & { users: string[] }> = ({ users, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            オンラインユーザー
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {users.length === 0 ? (
            <p className="text-center text-slate-400 py-8">オンラインのユーザーはいません</p>
          ) : (
            users.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                  {user[0]}
                </div>
                <span className="font-bold text-slate-700 truncate">{user}</span>
              </div>
            ))
          )}
        </div>
        
        <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl mt-6 transition-colors">
          閉じる
        </button>
      </div>
    </div>
  );
};
