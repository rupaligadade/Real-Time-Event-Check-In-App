import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import { json } from "body-parser";
import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

const prisma = new PrismaClient();

const typeDefs = `#graphql
  type User {
    id: String!
    name: String!
    email: String!
  }

  type Event {
    id: String!
    name: String!
    location: String!
    startTime: String!
    attendees: [User!]!
  }

  type Query {
    events: [Event!]!
    me: User
  }

  type Mutation {
    joinEvent(eventId: String!): Event
  }
`;

const resolvers = {
  Query: {
    events: async () => prisma.event.findMany({ include: { attendees: true } }),
    me: async () => prisma.user.findFirst(),
  },
  Mutation: {
    joinEvent: async (_: any, { eventId }: { eventId: string }, context: any) => {
      const user = await prisma.user.findFirst();
      if (!user) throw new Error("User not found");

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            connect: { id: user.id },
          },
        },
        include: { attendees: true },
      });

      context.io.emit(`event-${eventId}-update`, updatedEvent.attendees);
      return updatedEvent;
    },
  },
};

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async () => ({
        prisma,
        io,
      }),
    })
  );

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => console.error(" Server failed:", err));
