// src/bluesky-ingest.js
let cursor = null;
let subscribers = [];
let polling = false;

export function subscribe(cb) {
  subscribers.push(cb);
  return () => { subscribers = subscribers.filter(x => x !== cb); };
}

function emit(evt) {
  subscribers.forEach(cb => { try { cb(evt); } catch(e) { console.error(e); } });
}

async function fetchOnce() {
  // Mock data for demonstration
  const mockUsers = [
    'user1.bsky.social', 'user2.bsky.social', 'user3.bsky.social',
    'user4.bsky.social', 'user5.bsky.social', 'user6.bsky.social',
    'user7.bsky.social', 'user8.bsky.social', 'user9.bsky.social',
    'user10.bsky.social'
  ];
  
  // Simulate 2-5 random interactions
  const interactionCount = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < interactionCount; i++) {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    emit({ type: "post", actor: randomUser, uri: `mock-${Date.now()}-${i}` });
  }
  
  console.log(`Generated ${interactionCount} mock interactions`);
}

export function startPolling(intervalMs = 5000) {
  if (polling) return;
  polling = true;
  async function loop() {
    await fetchOnce();
    if (polling) setTimeout(loop, intervalMs);
  }
  loop();
}

export function stopPolling() { polling = false; }

