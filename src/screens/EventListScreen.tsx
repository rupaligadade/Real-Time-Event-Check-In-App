import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { client } from '../api/graphqlClient';
import { GET_EVENTS } from '../api/queries';

type RootStackParamList = {
  EventDetail: { event: Event };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'EventDetail'>;

type Event = {
  id: string;
  name: string;
  location: string;
};

export default function EventListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => client.request<{ event: Event[] }>(GET_EVENTS),
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={data?.event}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EventDetail', { event: item })}
          style={{ padding: 16, borderBottomWidth: 1 }}
        >
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text>{item.location}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
