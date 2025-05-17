import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

const About = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 2,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[styles.milkSplash, { transform: [{ rotate: spin }] }]}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={styles.splashImage}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeValue, transform: [{ scale: scaleValue }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>Dairify</Text>
        <Text style={styles.tagline}>Empowering Dairy Commerce</Text>

        <View style={styles.featureRow}>
          <View style={[styles.featureCard, styles.featureCard1]}>
            <Ionicons name="storefront" size={32} color="#FF7043" />
            <Text style={styles.featureTitle}>Digital Shops</Text>
            <Text style={styles.featureText}>
              Create your own dairy shop online
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard2]}>
            <Ionicons name="cash" size={32} color="#66BB6A" />
            <Text style={styles.featureTitle}>Easy Payments</Text>
            <Text style={styles.featureText}>Safe aur secure transactions</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={[styles.featureCard, styles.featureCard3]}>
            <Ionicons name="bicycle" size={32} color="#42A5F5" />
            <Text style={styles.featureTitle}>Fast Delivery</Text>
            <Text style={styles.featureText}>Quick delivery to your home</Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard4]}>
            <Ionicons name="stats-chart" size={32} color="#AB47BC" />
            <Text style={styles.featureTitle}>Business Growth</Text>
            <Text style={styles.featureText}>Develop your business</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            Dairify is a modern platform where users can create their own shops
            to buy and sell dairy products. Our mission is to bring local dairy
            sellers into the digital world!
          </Text>

          <View style={styles.dairyIcons}>
            <Ionicons
              name="nutrition"
              size={28}
              color="#FFD54F"
              style={styles.dairyIcon}
            />
            <Ionicons
              name="ice-cream"
              size={28}
              color="#AED581"
              style={styles.dairyIcon}
            />
            <Ionicons
              name="pint"
              size={28}
              color="#81D4FA"
              style={styles.dairyIcon}
            />
            <Ionicons
              name="egg"
              size={28}
              color="#FFAB91"
              style={styles.dairyIcon}
            />
          </View>
        </View>

        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Over Team</Text>

          <View style={styles.teamRow}>
            <View style={styles.teamMember}>
              <Image
                source={require("../../assets/bilal.jpg")}
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Ahmed Bilal</Text>
              <Text style={styles.teamRole}>Onwer</Text>
            </View>

            <View style={styles.teamMember}>
              <Image
                source={require("../../assets/team.jpg")}
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Ahmed Bilal</Text>
              <Text style={styles.teamRole}>Developer</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL("tel:03162554975")}
        >
          <Text style={styles.contactButtonText}>Contact Us</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 0,
    backgroundColor: "#F9F9F9",
    minHeight: "100%",
  },
  milkSplash: {
    position: "absolute",
    top: -100,
    right: -100,
    opacity: 0.1,
  },
  splashImage: {
    width: 300,
    height: 300,
  },
  content: {
    width: "100%",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    top: -10,
    left: -10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
    textShadowColor: "rgba(76, 175, 80, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: "#555",
    marginBottom: 30,
    fontWeight: "500",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  featureCard1: {
    borderTopWidth: 4,
    borderTopColor: "#FF7043",
  },
  featureCard2: {
    borderTopWidth: 4,
    borderTopColor: "#66BB6A",
  },
  featureCard3: {
    borderTopWidth: 4,
    borderTopColor: "#42A5F5",
  },
  featureCard4: {
    borderTopWidth: 4,
    borderTopColor: "#AB47BC",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#333",
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  descriptionBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  dairyIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dairyIcon: {
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 15,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  teamSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  teamRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    width: "100%",
    gap: 10,
  },

  teamMember: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  teamRole: {
    fontSize: 14,
    color: "#666",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 40,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 10,
  },
});

export default About;
