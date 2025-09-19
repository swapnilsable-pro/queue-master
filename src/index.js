import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

async function startServer() {
  // Create Apollo Server with federation support
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    // Enable introspection and playground in development
    introspection: true,
    // Add some logging
    plugins: [
      {
        requestDidStart() {
          return {
            didResolveOperation(requestContext) {
              console.log(`🎛️ GraphQL Operation: ${requestContext.request.operationName || 'unnamed'}`);
            },
          };
        },
      },
    ],
  });

  // Start the server
  const { url } = await startStandaloneServer(server, {
    listen: { port: 3002 },
    context: async ({ req }) => {
      return {
        // Add any context here
      };
    },
  });

  console.log('🎛️ Queue Master Service Ready!');
  console.log(`🚀 Server running at: ${url}`);
  console.log(`📋 GraphQL Schema: QueueItem, queue/upvote/downvote mutations`);
  console.log(`🎵 In-memory queue storage initialized`);
  
  // Add some sample queue items for testing
  console.log('🔧 Adding sample queue items...');
  const { queueStore } = await import('./queueStore.js');
  queueStore.addSong('1'); // Kafka Beats Vol. 1
  queueStore.addSong('2'); // Rails Symphony
  queueStore.upvoteSong('2'); // Give Rails Symphony an extra vote
  console.log(`📊 Queue initialized with ${queueStore.getSize()} songs`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Queue Master shutting down...');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('❌ Failed to start Queue Master:', error);
  process.exit(1);
});
