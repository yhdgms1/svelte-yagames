import type { SavedData } from "../types";
import { isEmpty } from '.';

const getNewest = (preferred: SavedData, backup: SavedData) => {
  if ('timestamp' in preferred && 'timestamp' in backup) {
    return [preferred, backup].reduce((prev, curr) => prev.timestamp > curr.timestamp ? prev : curr).data;
  }

  if (isEmpty(backup)) {
    return preferred;
  }

  if (isEmpty(preferred)) {
    return backup;
  }

  return preferred;
}

export { getNewest }