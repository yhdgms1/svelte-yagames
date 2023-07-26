type Thenable<T> = T | Promise<T>;

type SavedData = Record<PropertyKey, any> | {
  timestamp: number;
  data: Record<PropertyKey, any>;
};

export type { Thenable, SavedData }