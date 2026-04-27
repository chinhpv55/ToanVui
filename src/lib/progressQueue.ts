// Reliable adaptive progress submission with retry + offline queue.
// Why: previously /api/adaptive errors were swallowed silently — if the network
// flapped during practice, a kid's stars/mastery just vanished without a trace.
//
// Strategy:
//   1. Try the call up to 3 times with backoff (handles transient 5xx + flaky 4G).
//   2. If still failing, persist the payload to localStorage so the next page
//      load can retry. Drain the queue on every adaptive submit and on layout mount.

const QUEUE_KEY = "vuitoan_progress_queue_v1";
const MAX_QUEUE = 200; // hard cap so a stuck device can't grow forever

export interface ProgressPayload {
  student_id: string;
  topic_id: string;
  is_correct: boolean;
}

interface QueuedItem extends ProgressPayload {
  queued_at: number;
}

function readQueue(): QueuedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedItem[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = items.slice(-MAX_QUEUE);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or disabled — give up silently
  }
}

function enqueue(payload: ProgressPayload) {
  const items = readQueue();
  items.push({ ...payload, queued_at: Date.now() });
  writeQueue(items);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postOnce(payload: ProgressPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/adaptive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Submit adaptive progress with durable queueing.
// Always enqueue first so the write survives a tab close mid-request, then
// drain the queue. drainProgressQueue retries everything in order; whatever
// fails stays in localStorage for the next page load.
export async function submitProgress(payload: ProgressPayload): Promise<void> {
  enqueue(payload);
  await drainProgressQueue();
}

// Concurrency guard so a fast typer doesn't trigger overlapping drains
// (which would double-post the same queued item).
let draining: Promise<void> | null = null;

// Flush the queue with retries. Each item gets up to 3 attempts; whatever
// can't go through (server still down) stays in localStorage for next load.
// Stops at the first item that fails all retries to preserve write order.
export function drainProgressQueue(): Promise<void> {
  if (draining) return draining;
  draining = (async () => {
    try {
      let items = readQueue();
      if (items.length === 0) return;

      while (items.length > 0) {
        const head = items[0];
        const { student_id, topic_id, is_correct } = head;
        let ok = false;
        const delays = [0, 600, 1500];
        for (const d of delays) {
          if (d > 0) await sleep(d);
          if (await postOnce({ student_id, topic_id, is_correct })) {
            ok = true;
            break;
          }
        }
        if (!ok) {
          console.warn(
            `[progressQueue] ${items.length} writes still pending — will retry next load`
          );
          return;
        }
        // Pop head, persist immediately so a crash mid-drain doesn't replay it.
        items = items.slice(1);
        writeQueue(items);
      }
      console.info("[progressQueue] flushed all pending writes");
    } finally {
      draining = null;
    }
  })();
  return draining;
}

export function getQueuedCount(): number {
  return readQueue().length;
}
