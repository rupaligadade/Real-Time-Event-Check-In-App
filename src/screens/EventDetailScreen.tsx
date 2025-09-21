import React, { useEffect } from "react";
import { Text, View } from "react-native";
import useSockets from "src/hooks/useSockets";
import useAuthStore from "src/store/useAuth";






export default function EventDetailsScreen() {
  const socket = useSockets();
  const auth = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    socket.on("message", (msg: any) => {
      console.log(" New message:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, [socket]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Welcome {auth.user?.name || "Guest"} 👋</Text>
      <Text>Socket Status: {socket ? "Connected" : "Not Connected"}</Text>
    </View>
  );
}