import { queueStore } from './queueStore.js';
import { kafkaService } from './kafkaService.js';

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
    queueSong: async (_, { songId }) => {
      console.log(`🎵 Queueing song: ${songId}`);
      try {
        // 1. Update the database
        const queueItem = queueStore.addSong(songId);
        console.log(`✅ Song ${songId} added to queue at position ${queueItem.position}`);
        
        // 2. Publish Kafka event
        await kafkaService.publishSongQueued(songId, queueItem);
        
        // 3. Publish queue updated event
        const updatedQueue = queueStore.getQueue();
        await kafkaService.publishQueueUpdated(updatedQueue);
        
        return queueItem;
      } catch (error) {
        console.error(`❌ Error queueing song ${songId}:`, error.message);
        throw error;
      }
    },

    upvoteSong: async (_, { songId }) => {
      console.log(`👍 Upvoting song: ${songId}`);
      try {
        // 1. Update the database
        const queueItem = queueStore.upvoteSong(songId);
        console.log(`✅ Song ${songId} upvoted, now has ${queueItem.votes} votes at position ${queueItem.position}`);
        
        // 2. Publish Kafka event
        await kafkaService.publishSongUpvoted(songId, queueItem);
        
        // 3. Publish queue updated event (queue order might have changed)
        const updatedQueue = queueStore.getQueue();
        await kafkaService.publishQueueUpdated(updatedQueue);
        
        return queueItem;
      } catch (error) {
        console.error(`❌ Error upvoting song ${songId}:`, error.message);
        throw error;
      }
    },

    downvoteSong: async (_, { songId }) => {
      console.log(`👎 Downvoting song: ${songId}`);
      try {
        // 1. Update the database
        const queueItem = queueStore.downvoteSong(songId);
        console.log(`✅ Song ${songId} downvoted, now has ${queueItem.votes} votes at position ${queueItem.position}`);
        
        // 2. Publish Kafka event
        await kafkaService.publishSongDownvoted(songId, queueItem);
        
        // 3. Publish queue updated event (queue order might have changed)
        const updatedQueue = queueStore.getQueue();
        await kafkaService.publishQueueUpdated(updatedQueue);
        
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
