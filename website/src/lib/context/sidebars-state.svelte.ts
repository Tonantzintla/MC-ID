import { PersistedState } from "runed";
import { createContext } from "svelte";

type SidebarsStateData = Record<string, boolean>;

export class SidebarsStateContext {
  #data = new PersistedState<SidebarsStateData>("mcidSidebarsState", {
    userSidebar: true,
    devSidebar: false,
    adminSidebar: true
  });

  get current() {
    return this.#data.current;
  }

  set current(value: SidebarsStateData) {
    this.#data.current = value;
  }
}

const [getSidebarsState, setSidebarsState] = createContext<SidebarsStateContext>();

function initSidebarsState() {
  const sidebarsState = new SidebarsStateContext();
  setSidebarsState(sidebarsState);
  return sidebarsState;
}

export { getSidebarsState, initSidebarsState };
