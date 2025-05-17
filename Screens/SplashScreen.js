import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.3)).current;
  const milkAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    {
      title: "Premium Dairy",
      subtitle: "Farm fresh products delivered to your doorstep",
      emoji: "🥛",
    },
    {
      title: "100% Natural",
      subtitle: "No preservatives or artificial ingredients",
      emoji: "🐄",
    },
    {
      title: "Daily Delivery",
      subtitle: "Always fresh, always on time",
      emoji: "⏰",
    },
  ];

  // Milk drop animation sequence
  const animateMilkDrop = () => {
    milkAnim.setValue(0);
    Animated.sequence([
      Animated.timing(milkAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(milkAnim, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance steps
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
      animateMilkDrop();
    }, 2500);

    // Navigate after 6 seconds
    const timeout = setTimeout(() => {}, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentStep && styles.activeDot]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Milk Drop Animation */}
      <Animated.View
        style={[
          styles.milkContainer,
          {
            opacity: milkAnim,
            transform: [
              {
                translateY: milkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              },
              {
                scale: milkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.milkEmoji}>🥛</Text>
      </Animated.View>

      {/* Logo & Title */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🥛</Text>
        </View>
        <Text style={styles.appName}>Dairify</Text>
      </Animated.View>

      {/* Step Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.stepEmoji}>{steps[currentStep].emoji}</Text>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      </Animated.View>

      {/* Progress Dots */}
      {renderDots()}

      {/* Skip Button */}
      {/* <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace("home")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  milkContainer: {
    position: "absolute",
    top: height * 0.1,
  },
  milkEmoji: {
    fontSize: 100,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    letterSpacing: 1,
  },
  contentContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  stepEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bdc3c7",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3498db",
    width: 20,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: "#7f8c8d",
    fontSize: 16,
  },
});

export default SplashScreen;
