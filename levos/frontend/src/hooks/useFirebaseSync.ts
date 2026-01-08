import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { database } from '../config/firebase';
import { storage } from './useLocalStorage';

type SyncStatus = 'connecting' | 'synced' | 'offline';

interface UseSyncOptions<T> {
  key: string;
  userId: string | null;
  defaultValue: T;
  onRemoteChange?: (value: T) => void;
}

export function useFirebaseSync<T>({
  key,
  userId,
  defaultValue,
  onRemoteChange,
}: UseSyncOptions<T>) {
  const [value, setValue] = useState<T>(() => storage.get(key, defaultValue));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const isLocalUpdate = useRef(false);

  // Subscribe to Firebase changes
  useEffect(() => {
    if (!userId) {
      setSyncStatus('offline');
      return;
    }

    const dbRef = ref(database, `users/${userId}/${key}`);
    setSyncStatus('connecting');

    onValue(
      dbRef,
      (snapshot) => {
        const remoteValue = snapshot.val();
        setSyncStatus('synced');

        if (remoteValue !== null && !isLocalUpdate.current) {
          setValue(remoteValue);
          storage.set(key, remoteValue);
          onRemoteChange?.(remoteValue);
        }
        isLocalUpdate.current = false;
      },
      (error) => {
        console.error(`Firebase sync error for ${key}:`, error);
        setSyncStatus('offline');
      }
    );

    // Initial sync: push local data to Firebase if remote is empty
    onValue(dbRef, (snapshot) => {
      if (snapshot.val() === null) {
        const localValue = storage.get(key, defaultValue);
        if (localValue !== defaultValue) {
          set(dbRef, localValue);
        }
      }
    }, { onlyOnce: true });

    return () => {
      off(dbRef);
    };
  }, [userId, key, defaultValue, onRemoteChange]);

  // Update both local and remote
  const updateValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const resolvedValue = newValue instanceof Function ? newValue(value) : newValue;

      isLocalUpdate.current = true;
      setValue(resolvedValue);
      storage.set(key, resolvedValue);

      if (userId) {
        const dbRef = ref(database, `users/${userId}/${key}`);
        set(dbRef, resolvedValue).catch((error) => {
          console.error(`Failed to sync ${key} to Firebase:`, error);
        });
      }
    },
    [userId, key, value]
  );

  return {
    value,
    setValue: updateValue,
    syncStatus,
  };
}

// Hook for multiple synced values
export function useSyncedState(userId: string | null) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');

  useEffect(() => {
    if (!userId) {
      setSyncStatus('offline');
      return;
    }

    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      setSyncStatus(snapshot.val() ? 'synced' : 'offline');
    });

    return () => {
      off(connectedRef);
    };
  }, [userId]);

  return { syncStatus };
}
