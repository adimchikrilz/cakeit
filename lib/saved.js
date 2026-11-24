// remembers this device's tickets so the QR is one tap away after a refresh or a new visit
const K = "cake_tickets";
export const saved = () => { try { return JSON.parse(localStorage.getItem(K)) || []; } catch { return []; } };
export const save = token => { try { localStorage.setItem(K, JSON.stringify([token, ...saved().filter(x => x !== token)].slice(0, 10))); } catch {} };
