import * as devalue from "devalue";
import { PersistedState } from "runed";
import { createContext } from "svelte";

type LastSyncedData = Date;

export class LastSyncedContext {
  #data = new PersistedState<LastSyncedData>("mcidLastSynced", undefined!, {
    serializer: {
      serialize: devalue.stringify,
      deserialize: devalue.parse
    }
  });

  get current() {
    return this.#data.current;
  }

  set current(value: LastSyncedData) {
    this.#data.current = value;
  }
}

const [getLastSynced, setLastSynced] = createContext<LastSyncedContext>();

function initLastSynced() {
  const lastSynced = new LastSyncedContext();
  setLastSynced(lastSynced);
  return lastSynced;
}

export { getLastSynced, initLastSynced };
