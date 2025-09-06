import * as devalue from "devalue";
import { persisted } from "svelte-persisted-store";

// First param `lastSynced` is the local storage key.
// Second param is the initial value.
export const lastSynced = persisted<Date>("lastSynced", undefined!, {
  serializer: devalue,
  syncTabs: true
});
