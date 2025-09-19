// In-memory queue storage
class QueueStore {
  constructor() {
    this.queue = new Map(); // songId -> QueueItem
    this.nextPosition = 1;
  }

  // Add a song to the queue
  addSong(songId) {
    if (this.queue.has(songId)) {
      // Song already in queue, just return it
      return this.queue.get(songId);
    }

    const queueItem = {
      songId: songId,
      position: this.nextPosition++,
      votes: 1, // Start with 1 vote (the person who queued it)
      queuedAt: new Date().toISOString()
    };

    this.queue.set(songId, queueItem);
    return queueItem;
  }

  // Get all queue items sorted by position
  getQueue() {
    return Array.from(this.queue.values())
      .sort((a, b) => a.position - b.position);
  }

  // Get specific queue item
  getQueueItem(songId) {
    return this.queue.get(songId) || null;
  }

  // Upvote a song (increases priority)
  upvoteSong(songId) {
    const item = this.queue.get(songId);
    if (!item) {
      throw new Error(`Song ${songId} is not in the queue`);
    }

    item.votes += 1;
    
    // Reorder queue based on votes (higher votes = lower position number)
    this.reorderQueue();
    
    return item;
  }

  // Downvote a song (decreases priority)
  downvoteSong(songId) {
    const item = this.queue.get(songId);
    if (!item) {
      throw new Error(`Song ${songId} is not in the queue`);
    }

    item.votes = Math.max(0, item.votes - 1);
    
    // Reorder queue based on votes
    this.reorderQueue();
    
    return item;
  }

  // Reorder queue based on votes (higher votes get better positions)
  reorderQueue() {
    const items = Array.from(this.queue.values())
      .sort((a, b) => {
        // First sort by votes (descending), then by queuedAt (ascending)
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return new Date(a.queuedAt) - new Date(b.queuedAt);
      });

    // Update positions
    items.forEach((item, index) => {
      item.position = index + 1;
    });
  }

  // Remove a song from queue (for future use)
  removeSong(songId) {
    return this.queue.delete(songId);
  }

  // Get queue size
  getSize() {
    return this.queue.size;
  }
}

export const queueStore = new QueueStore();
