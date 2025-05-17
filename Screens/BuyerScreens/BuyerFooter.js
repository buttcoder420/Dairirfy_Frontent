import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";

const BuyerFooter = ({ orderUpdateTrigger }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const badgeScale = new Animated.Value(1);

  const fetchActiveOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/order/get-order",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const activeOrders = response.data.orders.filter(
        (order) =>
          !["cancelled", "delivered", "completed"].includes(
            order.status.toLowerCase()
          )
      );

      setActiveOrderCount(activeOrders.length);
      animateBadge();
    } catch (error) {
      setActiveOrderCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const animateBadge = () => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    fetchActiveOrders();
  }, [token, orderUpdateTrigger]);

  const navigateToPage = (screenName) => {
    navigation.navigate(screenName);
  };

  const isActive = (screenName) => {
    return route.name === screenName ? "#e67e22" : "#555";
  };

  return (
    <View style={styles.footerContainer}>
      {["buyerdashboard", "order", "account"].map((screen) => (
        <TouchableOpacity
          key={screen}
          style={styles.iconContainer}
          onPress={() => navigateToPage(screen)}
        >
          <Ionicons
            name={
              screen === "buyerdashboard"
                ? "home"
                : screen === "order"
                ? "cart"
                : "person"
            }
            size={26}
            color={isActive(screen)}
          />
          {screen === "order" && !isLoading && activeOrderCount > 0 && (
            <Animated.View
              style={[styles.badge, { transform: [{ scale: badgeScale }] }]}
            >
              <Text style={styles.badgeText}>{activeOrderCount}</Text>
            </Animated.View>
          )}
          <Text style={[styles.iconLabel, { color: isActive(screen) }]}>
            {screen === "buyerdashboard"
              ? "Home"
              : screen === "order"
              ? "Orders"
              : "Accont"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    position: "relative",
  },
  iconLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: 2,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default BuyerFooter;
