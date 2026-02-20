import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from './storage';

// ─── CONFIG ──────────────────────────────────────────────
// Fill these in from your MongoDB Atlas App Services dashboard
const ATLAS_APP_ID = 'YOUR_APP_ID';         // e.g. "data-abcde"
const ATLAS_API_KEY = 'YOUR_API_KEY';        // from Data API keys
const ATLAS_CLUSTER = 'Cluster0';            // your cluster name
const DB_NAME = 'habit_tracker';
const COLLECTION = 'states';
// ─────────────────────────────────────────────────────────

const BASE = `https://data.mongodb-api.com/app/${ATLAS_APP_ID}/endpoint/data/v1/action`;

const HEADERS = {
  'Content-Type': 'application/json',
  'api-key': ATLAS_API_KEY,
};

const USER_ID_KEY = 'habit_user_id';

export async function getUserId(): Promise<string> {
  let id = await AsyncStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await AsyncStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

// ── Save / update full state ──────────────────────────────
export async function syncToMongo(state: AppState): Promise<void> {
  try {
    const userId = await getUserId();
    await fetch(`${BASE}/updateOne`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        dataSource: ATLAS_CLUSTER,
        database: DB_NAME,
        collection: COLLECTION,
        filter: { userId },
        update: {
          $set: {
            userId,
            state,
            updatedAt: { $date: new Date().toISOString() },
          },
        },
        upsert: true,
      }),
    });
  } catch (e) {
    // Silently fail — local AsyncStorage is always the source of truth
    console.warn('Atlas sync failed (offline?):', e);
  }
}

// ── Load state from Atlas ─────────────────────────────────
export async function loadFromMongo(): Promise<AppState | null> {
  try {
    const userId = await getUserId();
    const res = await fetch(`${BASE}/findOne`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        dataSource: ATLAS_CLUSTER,
        database: DB_NAME,
        collection: COLLECTION,
        filter: { userId },
      }),
    });
    const json = await res.json();
    return json?.document?.state ?? null;
  } catch (e) {
    console.warn('Atlas load failed (offline?):', e);
    return null;
  }
}

// ── Get list of all synced months ─────────────────────────
export async function getMonthHistory(): Promise<string[]> {
  try {
    const userId = await getUserId();
    const res = await fetch(`${BASE}/findOne`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        dataSource: ATLAS_CLUSTER,
        database: DB_NAME,
        collection: COLLECTION,
        filter: { userId },
        projection: { 'state.monthData': 1 },
      }),
    });
    const json = await res.json();
    const monthData = json?.document?.state?.monthData ?? {};
    return Object.keys(monthData).sort().reverse();
  } catch (e) {
    return [];
  }
}