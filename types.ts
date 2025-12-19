
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export interface Thread {
  id: string;
  memberId: string;
  icon?: string;
  title: string;
  detail: string;
  image?: string;
  password?: string;
  color: string;
  postCount: number;
  latestPostTime: Timestamp;
  created_at: Timestamp;
  locked: boolean;
  likes: number;
  dislikes: number;
}

export interface Post {
  id: string;
  memberId: string;
  icon?: string;
  body: string;
  image?: string;
  color: string;
  created_at: Timestamp;
  index: number;
}

export interface Room {
  id: string;
  icon?: string;
  created_at: Timestamp;
}

export type SortMode = 'new' | 'old' | 'latestPost' | 'high';
