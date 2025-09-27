import { Kafka } from 'kafkajs';

// Kafka configuration - we'll use environment variables for production
const kafka = new Kafka({
  clientId: 'queue-master',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'], // Default to local Kafka for dev
  // For Confluent Cloud, we'll add SASL authentication here
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_USERNAME ? {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  } : undefined,
});

// Create producer instance
const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

// Topic name for queue events
const QUEUE_EVENTS_TOPIC = 'queue-events';

class KafkaService {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      await producer.connect();
      this.isConnected = true;
      console.log('🔌 Kafka producer connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Kafka:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    try {
      await producer.disconnect();
      this.isConnected = false;
      console.log('🔌 Kafka producer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from Kafka:', error);
    }
  }

  async publishEvent(eventType, payload) {
    if (!this.isConnected) {
      console.warn('⚠️ Kafka not connected, skipping event publication');
      return;
    }

    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      payload,
    };

    try {
      await producer.send({
        topic: QUEUE_EVENTS_TOPIC,
        messages: [
          {
            key: `${eventType}_${Date.now()}`,
            value: JSON.stringify(event),
            headers: {
              eventType,
              source: 'queue-master',
            },
          },
        ],
      });

      console.log(`📡 Published ${eventType} event:`, event);
    } catch (error) {
      console.error(`❌ Failed to publish ${eventType} event:`, error);
    }
  }

  // Specific event publishers for our queue operations
  async publishSongQueued(songId, queueItem, user = 'anonymous') {
    await this.publishEvent('SONG_QUEUED', {
      songId,
      position: queueItem.position,
      votes: queueItem.votes,
      user,
    });
  }

  async publishSongUpvoted(songId, queueItem, user = 'anonymous') {
    await this.publishEvent('SONG_UPVOTED', {
      songId,
      position: queueItem.position,
      votes: queueItem.votes,
      user,
    });
  }

  async publishSongDownvoted(songId, queueItem, user = 'anonymous') {
    await this.publishEvent('SONG_DOWNVOTED', {
      songId,
      position: queueItem.position,
      votes: queueItem.votes,
      user,
    });
  }

  async publishQueueUpdated(queue) {
    await this.publishEvent('QUEUE_UPDATED', {
      queue,
      totalItems: queue.length,
    });
  }
}

// Export singleton instance
export const kafkaService = new KafkaService();
