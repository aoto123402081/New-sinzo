
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, query, orderBy, onSnapshot, doc, getDocs, 
  addDoc, deleteDoc, updateDoc, setDoc, getDoc, 
  Timestamp, serverTimestamp, increment 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from './firebase';
import { Thread, Post, Room, SortMode } from './types';
import Header from './components/Header';
import RoomSelector from './components/RoomSelector';
import ThreadList from './components/ThreadList';
import PostList from './components/PostList';
import { CreateThreadModal, CreatePostModal, AdminModal, ImageModal, PasswordModal, OnlineUsersModal, CreateRoomModal } from './components/Modals';

const App: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<string>('threads');
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('new');
  
  // Modals
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showImage, setShowImage] = useState<string | null>(null);
  const [passwordModalData, setPasswordModalData] = useState<{thread: Thread} | null>(null);

  const [nickName, setNickName] = useState<string>(() => {
    return localStorage.getItem('nickName') || '名称未設定';
  });

  const [userIcon, setUserIcon] = useState<string>(() => {
    return localStorage.getItem('userIcon') || '';
  });

  // Listen for Rooms
  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    });
    return () => unsub();
  }, []);

  // Listen for Threads in Current Room
  useEffect(() => {
    const q = query(collection(db, currentRoom), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Thread));
      setThreads(data);
    });
    return () => unsub();
  }, [currentRoom]);

  // Online Count Heartbeat
  useEffect(() => {
    const onlineRef = doc(db, "online", nickName + Math.random().toString(36).slice(2));
    const heartbeat = () => {
      setDoc(onlineRef, { t: serverTimestamp(), name: nickName }, { merge: true });
    };
    heartbeat();
    const interval = setInterval(heartbeat, 20000);

    const unsub = onSnapshot(collection(db, "online"), (snap) => {
      const now = Date.now();
      const userSet = new Set<string>();
      snap.forEach(d => {
        const data = d.data();
        if (!data.t) return;
        const ts = data.t.toMillis ? data.t.toMillis() : new Date(data.t).getTime();
        if (now - ts < 45000) {
          userSet.add(data.name || "名称未設定");
        }
      });
      // セットを使用しているため重複は自動的に排除される
      setOnlineUsers(Array.from(userSet));
      setOnlineCount(userSet.size);
    });

    return () => {
      clearInterval(interval);
      unsub();
      deleteDoc(onlineRef).catch(() => {});
    };
  }, [nickName]);

  const sortedThreads = [...threads].sort((a, b) => {
    if (sortMode === 'new') return (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0);
    if (sortMode === 'old') return (a.created_at?.toMillis() || 0) - (b.created_at?.toMillis() || 0);
    if (sortMode === 'latestPost') return (b.latestPostTime?.toMillis() || 0) - (a.latestPostTime?.toMillis() || 0);
    if (sortMode === 'high') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const handleThreadClick = (thread: Thread) => {
    if (thread.locked) {
      alert("このスレッドはロックされています");
      return;
    }
    if (thread.password) {
      setPasswordModalData({ thread });
    } else {
      setCurrentThread(thread);
    }
  };

  const handleRate = async (threadId: string, type: 'like' | 'dislike') => {
    const key = `rate_${threadId}`;
    if (localStorage.getItem(key)) {
      alert("すでに評価済みです");
      return;
    }
    const update = type === 'like' ? { likes: increment(1) } : { dislikes: increment(1) };
    try {
      await updateDoc(doc(db, currentRoom, threadId), update);
      localStorage.setItem(key, type);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIdentityChange = (name: string, icon: string) => {
    setNickName(name);
    setUserIcon(icon);
    localStorage.setItem('nickName', name);
    localStorage.setItem('userIcon', icon);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header 
        onlineCount={onlineCount} 
        onlineUsers={onlineUsers}
        onAdmin={() => setShowAdmin(true)}
        onShowOnline={() => setShowOnlineModal(true)}
        currentRoom={currentRoom}
        rooms={rooms}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <RoomSelector 
          currentRoom={currentRoom} 
          onSwitch={(room) => {
            setCurrentRoom(room);
            setCurrentThread(null);
          }}
          onAddRoom={() => setShowCreateRoom(true)}
          rooms={rooms}
        />

        {!currentThread ? (
          <ThreadList 
            threads={sortedThreads} 
            sortMode={sortMode}
            onSortChange={setSortMode}
            onThreadClick={handleThreadClick}
            onShowImage={setShowImage}
            onRate={handleRate}
          />
        ) : (
          <PostList 
            thread={currentThread} 
            currentRoom={currentRoom}
            onBack={() => setCurrentThread(null)}
            onShowImage={setShowImage}
          />
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        {!currentThread ? (
          <button 
            onClick={() => setShowCreateThread(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">📄</span>
            <span className="font-bold hidden sm:inline">スレッド作成</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowCreatePost(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">📝</span>
            <span className="font-bold hidden sm:inline">投稿する</span>
          </button>
        )}
      </div>

      {/* Modals */}
      {showCreateThread && (
        <CreateThreadModal 
          currentRoom={currentRoom}
          nickName={nickName}
          userIcon={userIcon}
          onClose={() => setShowCreateThread(false)}
          onSuccess={handleIdentityChange}
        />
      )}
      {showCreatePost && currentThread && (
        <CreatePostModal 
          threadId={currentThread.id}
          currentRoom={currentRoom}
          nickName={nickName}
          userIcon={userIcon}
          onClose={() => setShowCreatePost(false)}
          onSuccess={handleIdentityChange}
        />
      )}
      {showCreateRoom && (
        <CreateRoomModal 
          onClose={() => setShowCreateRoom(false)}
        />
      )}
      {showAdmin && (
        <AdminModal 
          currentRoom={currentRoom}
          onClose={() => setShowAdmin(false)}
          threads={threads}
        />
      )}
      {showOnlineModal && (
        <OnlineUsersModal 
          users={onlineUsers}
          onClose={() => setShowOnlineModal(false)}
        />
      )}
      {showImage && (
        <ImageModal src={showImage} onClose={() => setShowImage(null)} />
      )}
      {passwordModalData && (
        <PasswordModal 
          thread={passwordModalData.thread} 
          onClose={() => setPasswordModalData(null)}
          onSuccess={() => { setCurrentThread(passwordModalData.thread); setPasswordModalData(null); }}
        />
      )}
    </div>
  );
};

export default App;
