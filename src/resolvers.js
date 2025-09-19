import { queueStore } from './queueStore.js';

export const resolvers = {
  Query: {
    queue: () => {
      const queue = queueStore.getQueue();
      console.log(`📋 Queue requested: ${queue.length} items`);
      return queue;
    },

    queueItem: (_, { songId }) => {
      const item = queueStore.getQueueItem(songId);
      console.log(`🎵 Queue item requested for song ${songId}:`, item ? 'found' : 'not found');
      return item;
    },
  },

  Mutation: {
    queueSong: (_, { songId }) => {
      console.log(`🎵 Queueing song: ${songId}`);
      try {
        const queueItem = queueStore.addSong(songId);
        console.log(`✅ Song ${songId} added to queue at position ${queueItem.position}`);
        return queueItem;
      } catch (error) {
        console.error(`❌ Error queueing song ${songId}:`, error.message);
        throw error;
      }
    },

    upvoteSong: (_, { songId }) => {
      console.log(`👍 Upvoting song: ${songId}`);
      try {
        const queueItem = queueStore.upvoteSong(songId);
        console.log(`✅ Song ${songId} upvoted, now has ${queueItem.votes} votes at position ${queueItem.position}`);
        return queueItem;
      } catch (error) {
        console.error(`❌ Error upvoting song ${songId}:`, error.message);
        throw error;
      }
    },

    downvoteSong: (_, { songId }) => {
      console.log(`👎 Downvoting song: ${songId}`);
      try {
        const queueItem = queueStore.downvoteSong(songId);
        console.log(`✅ Song ${songId} downvoted, now has ${queueItem.votes} votes at position ${queueItem.position}`);
        return queueItem;
      } catch (error) {
        console.error(`❌ Error downvoting song ${songId}:`, error.message);
        throw error;
      }
    },
  },

  QueueItem: {
    __resolveReference: (queueItem) => {
      return queueStore.getQueueItem(queueItem.songId);
    },
  },
};
