import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { AuthProvider } from "./Context/AuthContext";
import AppNavigator from "./Navigat/AppNavigator";
import { StatusBar } from "react-native";

export const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
        <StatusBar hidden />
      </AuthProvider>
    </NavigationContainer>
  );
};
