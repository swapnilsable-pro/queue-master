import { gql } from 'graphql-tag';

export const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type QueueItem @key(fields: "songId") {
    songId: ID!
    position: Int!
    votes: Int!
    queuedAt: String!
  }

  extend type Query {
    queue: [QueueItem!]!
    queueItem(songId: ID!): QueueItem
  }

  extend type Mutation {
    queueSong(songId: ID!): QueueItem!
    upvoteSong(songId: ID!): QueueItem!
    downvoteSong(songId: ID!): QueueItem!
  }
`;
