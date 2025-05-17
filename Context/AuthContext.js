import React, { createContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const baseURL = "https://finalyear-backend.onrender.com/api/v1";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@auth");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          axios.defaults.baseURL = baseURL;
          axios.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.log("Error loading user data", error);
      } finally {
        setLoading(false); // jab check ho jaye to loading false
      }
    };
    loadUserData();
  }, []);

  const login = async (userData, token) => {
    setUser(userData);
    setToken(token);
    await AsyncStorage.setItem("@auth", JSON.stringify(userData));
    await AsyncStorage.setItem("token", token);
    axios.defaults.baseURL = baseURL;
    axios.defaults.headers.Authorization = `Bearer ${token}`;
  };

  const logout = async () => {
    setUser(null);
    setToken("");
    await AsyncStorage.removeItem("@auth");
    await AsyncStorage.removeItem("token");
    delete axios.defaults.headers.Authorization;
    navigation.reset({
      index: 0,
      routes: [{ name: "login" }],
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
