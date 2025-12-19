
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { initializeFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9ygh6HjX5mK1e5ZBnEWnLQCEjRMKIEWA",
  authDomain: "sinzo-3f972.firebaseapp.com",
  projectId: "sinzo-3f972",
  storageBucket: "sinzo-3f972.firebasestorage.app",
  messagingSenderId: "1058985227031",
  appId: "1:1058985227031:web:2e3a31346805442e10bd52"
};

const app = initializeApp(firebaseConfig);

// initializeFirestoreを使用して設定をカスタマイズします。
// ネットワーク環境やプロキシの影響で標準のWebSocketsが遮断されるケースに対応するため、
// ロングポーリングを強制的に使用するように設定します。
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// オフライン状態でもデータを閲覧・操作できるように、ブラウザのIndexedDBを利用した永続化を有効にします。
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // 他のタブで既にアプリが開かれている場合に発生します
        console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // ブラウザがIndexedDBをサポートしていない場合に発生します
        console.warn('Firestore persistence not supported by this browser');
    }
});
