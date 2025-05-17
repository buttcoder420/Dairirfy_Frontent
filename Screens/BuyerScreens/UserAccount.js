import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  Linking,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../Context/AuthContext";
import BuyerFooter from "./BuyerFooter";

const { width, height } = Dimensions.get("window");

const UserAccount = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [textScale] = useState(new Animated.Value(0.9));
  const [cardsAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 4,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCardPress = (screenName) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (screenName) {
        navigation.navigate(screenName);
      }
    });
  };

  const cardTranslateY = cardsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const cardOpacity = cardsAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Profile Section with Emoji */}
      <Animated.View
        style={[styles.profileContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity onPress={() => handleCardPress("profile")}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>👨‍💼</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {" "}
          {(user?.firstName || "Buyer") + " " + (user?.lastName || "")}
        </Text>
        <Text style={styles.profileEmail}> {user?.email || "Buyer"}</Text>
      </Animated.View>

      {/* Stylish Dairify Text */}
      <Animated.View
        style={[styles.brandContainer, { transform: [{ scale: textScale }] }]}
      >
        <Text style={styles.brandText}>
          <Text style={styles.brandTextLarge}>D</Text>
          <Text style={styles.brandTextNormal}>airify</Text>
        </Text>
        <View style={styles.brandUnderline} />
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards Section */}
        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.card, styles.cardPolicy]}
            onPress={() => handleCardPress("policy")}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Privacy Policy</Text>
              <Text style={styles.cardSubtitle}>
                Read our data protection guidelines
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardAbout]}
            onPress={() => handleCardPress("about")}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>About Us</Text>
              <Text style={styles.cardSubtitle}>
                Learn about Dairify's mission
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardHelp]}
            onPress={() => Linking.openURL("tel:03162554975")}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Help Center</Text>
              <Text style={styles.cardSubtitle}>
                Get support and assistance
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <BuyerFooter />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 20,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE8D6", // Peach background
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  emoji: {
    fontSize: 60,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  brandContainer: {
    alignItems: "center",
    marginVertical: 20,
    marginBottom: 90,
  },
  brandText: {
    fontSize: 42,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#FF9A76", // Peach color
    textShadowColor: "rgba(255, 154, 118, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  brandTextLarge: {
    fontSize: 48,
  },
  brandTextNormal: {
    fontSize: 38,
  },
  brandUnderline: {
    width: 100,
    height: 4,
    backgroundColor: "#FF9A76",
    borderRadius: 2,
    marginTop: 5,
    transform: [{ skewX: "-15deg" }],
  },
  cardsContainer: {
    paddingHorizontal: 25,
    marginBottom: 60,
    marginTop: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  cardArrow: {
    fontSize: 24,
    color: "#999",
    marginLeft: 10,
  },
  cardPolicy: {
    borderLeftWidth: 5,
    borderLeftColor: "#4a6cf7",
  },
  cardAbout: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF6B6B",
  },
  cardSettings: {
    borderLeftWidth: 5,
    borderLeftColor: "#20C997",
  },
  cardHelp: {
    borderLeftWidth: 5,
    borderLeftColor: "#FFC154",
  },
});

export default UserAccount;
