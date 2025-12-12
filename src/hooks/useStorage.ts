import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load value from storage on mount
  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load value"));
      console.error(`Error loading ${key} from storage:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        setError(null);
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to save value")
        );
        console.error(`Error saving ${key} to storage:`, err);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to remove value")
      );
      console.error(`Error removing ${key} from storage:`, err);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isLoading,
    error,
    reload: loadValue,
  };
};
