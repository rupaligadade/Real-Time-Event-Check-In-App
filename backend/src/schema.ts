// src/schema.ts
import { gql } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { signToken } from "./auth";

const prisma = new PrismaClient();

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Event {
    id: ID!
    name: String!
    location: String!
    startTime: String!
    attendees: [User!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    events: [Event!]!
    me: User
  }

  type Mutation {
    login(email: String!): AuthPayload!
    joinEvent(eventId: ID!): Event!
  }
`;

export const resolvers = {
  Query: {
    events: async () => {
      return prisma.event.findMany({
        include: { attendees: true }
      });
    },

    me: async (_: any, __: any, ctx: any) => {
      return ctx.user
        ? prisma.user.findUnique({ where: { id: ctx.user.id } })
        : null;
    }
  },

  Mutation: {
    login: async (_: any, { email }: { email: string }) => {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split("@")[0]
          }
        });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      return { token, user };
    },

    joinEvent: async (_: any, { eventId }: { eventId: string }, ctx: any) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            connect: { id: ctx.user.id }
          }
        },
        include: { attendees: true }
      });

      // Broadcast update using socket.io
      try {
        ctx.io.in(`event:${eventId}`).emit("attendeesUpdate", {
          eventId,
          attendees: updated.attendees
        });
      } catch (e) {
        console.warn("Socket emit failed:", e);
      }

      return updated;
    }
  }
};
