import { gql } from 'graphql-request';

export const GET_EVENTS = gql`
  query GetEvents {
    event {
      id
      name
      location
      startTime
    }
  }
`;

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      name
    }
  }
`;
