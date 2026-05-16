import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useSegmentSuggestions() {
  const [titles, setTitles] = useLocalStorage<string[]>("segment-titles", []);
  const [persons, setPersons] = useLocalStorage<string[]>("person-names", []);

  const addTitle = (title: string) => {
    if (title.trim() && !titles.includes(title.trim())) {
      setTitles([...titles, title.trim()]);
    }
  };

  const addPerson = (person: string) => {
    if (person.trim() && !persons.includes(person.trim())) {
      setPersons([...persons, person.trim()]);
    }
  };

  return {
    titles,
    persons,
    addTitle,
    addPerson,
  };
}
