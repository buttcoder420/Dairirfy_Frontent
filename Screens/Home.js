import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.8));
  const [buttonScale] = useState(new Animated.Value(0.9));
  const [bgRotate] = useState(new Animated.Value(0));
  const [textGlow] = useState(new Animated.Value(0));
  const [particles] = useState(new Animated.Value(0));

  // Complex animation sequence
  useEffect(() => {
    Animated.parallel([
      // Background rotation animation
      Animated.loop(
        Animated.timing(bgRotate, {
          toValue: 1,
          duration: 30000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),

      // Logo animation
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
        delay: 300,
      }),

      // Particle animation
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(particles, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Text glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(textGlow, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(textGlow, {
            toValue: 0.3,
            duration: 2500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ])
      ),

      // Main content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Button pop-in effect
    setTimeout(() => {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 1200);
  }, []);

  // Background transform interpolation
  const bgTransform = bgRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Text glow interpolation
  const glowColor = textGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.3)", "rgba(100,200,255,0.8)"],
  });

  // Particle animation interpolation
  const particleAnim = particles.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Create animated particles
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = i * 30 + Math.random() * 15;
      const distance = 80 + Math.random() * 40;

      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                {
                  translateX: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      0,
                      Math.cos((angle * Math.PI) / 180) * distance,
                    ],
                  }),
                },
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      0,
                      Math.sin((angle * Math.PI) / 180) * distance,
                    ],
                  }),
                },
                {
                  scale: particleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
              ],
              opacity: particleAnim,
              backgroundColor: `rgba(${Math.floor(Math.random() * 100 + 155)}, 
                                ${Math.floor(Math.random() * 100 + 155)}, 
                                255, 0.7)`,
            },
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View
        style={[
          styles.background,
          {
            transform: [{ rotate: bgTransform }],
          },
        ]}
      >
        <View style={[styles.bgGradient, styles.bgGradient1]} />
        <View style={[styles.bgGradient, styles.bgGradient2]} />
      </Animated.View>

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>{renderParticles()}</View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo with shine effect */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require("../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animated.View
            style={[
              styles.logoShine,
              {
                transform: [
                  {
                    translateX: textGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 200],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* Title with animated gradient text */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.title,
              {
                color: glowColor,
              },
            ]}
          >
            DAIRIFY
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          >
            Premium Dairy Experience
          </Animated.Text>
        </Animated.View>

        {/* Buttons with modern look */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
            <Animated.View
              style={[
                styles.buttonGlow,
                {
                  opacity: textGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.6],
                  }),
                },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("login")}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              SIGN IN
            </Text>
            <View style={styles.buttonBorder} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer with subtle animation */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
          },
        ]}
      >
        <Text style={styles.footerText}>
          © 2023 DAIRIFY | Premium Dairy Solutions
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1120",
  },
  background: {
    position: "absolute",
    width: width * 2,
    height: height * 2,
    top: -height * 0.5,
    left: -width * 0.5,
  },
  bgGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  bgGradient1: {
    backgroundColor: "#0a1a3a",
    opacity: 0.8,
  },
  bgGradient2: {
    backgroundColor: "#0a0e20",
    opacity: 0.9,
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  logoContainer: {
    marginBottom: 40,
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 90,
    backgroundColor: "rgba(20, 40, 80, 0.3)",
    overflow: "hidden",
  },
  logo: {
    width: 140,
    height: 140,
    zIndex: 2,
  },
  logoShine: {
    position: "absolute",
    width: 60,
    height: "200%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ rotate: "20deg" }],
    zIndex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 12,
    textShadowColor: "rgba(100, 200, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 18,
    letterSpacing: 3,
    color: "rgba(200, 220, 255, 0.7)",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
  },
  button: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  primaryButton: {
    backgroundColor: "#3a6af5",
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1.5,
    position: "relative",
    zIndex: 2,
  },
  secondaryButtonText: {
    color: "rgba(200, 220, 255, 0.9)",
  },
  buttonGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(100, 180, 255, 0.3)",
  },
  buttonBorder: {
    position: "absolute",
    width: "96%",
    height: "88%",
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "rgba(100, 180, 255, 0.4)",
    padding: 25,
  },
  footer: {
    padding: 20,
  },
  footerText: {
    color: "rgba(200, 220, 255, 0.3)",
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 1,
  },
});

export default Home;
