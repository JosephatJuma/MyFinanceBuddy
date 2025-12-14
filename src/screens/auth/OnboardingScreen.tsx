import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import Svg, { Path, Circle, Rect, G, Ellipse } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

const { width, height } = Dimensions.get("window");

// SVG Illustrations
const WalletIllustration = ({ color }: { color: string }) => (
  <Svg width={200} height={200} viewBox="0 0 200 200">
    {/* Wallet Body */}
    <Rect
      x="30"
      y="60"
      width="140"
      height="100"
      rx="12"
      fill={color}
      opacity="0.2"
    />
    <Rect x="30" y="70" width="140" height="90" rx="12" fill={color} />
    {/* Card Slot */}
    <Rect x="45" y="45" width="100" height="20" rx="4" fill={color} opacity="0.6" />
    {/* Button/Lock */}
    <Circle cx="145" cy="110" r="12" fill="#fff" opacity="0.9" />
    <Circle cx="145" cy="110" r="6" fill={color} />
    {/* Card Lines */}
    <Rect x="55" y="95" width="80" height="4" rx="2" fill="#fff" opacity="0.7" />
    <Rect x="55" y="110" width="60" height="4" rx="2" fill="#fff" opacity="0.7" />
    <Rect x="55" y="125" width="70" height="4" rx="2" fill="#fff" opacity="0.7" />
  </Svg>
);

const ChartIllustration = ({ color }: { color: string }) => (
  <Svg width={200} height={200} viewBox="0 0 200 200">
    {/* Chart Background */}
    <Rect x="30" y="40" width="140" height="120" rx="12" fill={color} opacity="0.1" />
    {/* Bars */}
    <Rect x="50" y="100" width="20" height="50" rx="4" fill={color} opacity="0.6" />
    <Rect x="80" y="80" width="20" height="70" rx="4" fill={color} opacity="0.8" />
    <Rect x="110" y="60" width="20" height="90" rx="4" fill={color} />
    <Rect x="140" y="90" width="20" height="60" rx="4" fill={color} opacity="0.7" />
    {/* Trend Line */}
    <Path
      d="M 45 120 Q 75 100 95 80 T 155 100"
      stroke="#10b981"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* Dots on trend line */}
    <Circle cx="45" cy="120" r="5" fill="#10b981" />
    <Circle cx="95" cy="80" r="5" fill="#10b981" />
    <Circle cx="155" cy="100" r="5" fill="#10b981" />
  </Svg>
);

const TargetIllustration = ({ color }: { color: string }) => (
  <Svg width={200} height={200} viewBox="0 0 200 200">
    {/* Target Circles */}
    <Circle cx="100" cy="100" r="70" fill={color} opacity="0.1" />
    <Circle cx="100" cy="100" r="50" fill={color} opacity="0.2" />
    <Circle cx="100" cy="100" r="30" fill={color} opacity="0.4" />
    <Circle cx="100" cy="100" r="15" fill={color} />
    {/* Arrow */}
    <G transform="rotate(-45 100 100)">
      <Rect x="95" y="30" width="10" height="60" fill="#ef4444" />
      <Path d="M 100 25 L 85 40 L 100 35 L 115 40 Z" fill="#ef4444" />
      <Circle cx="100" cy="100" r="8" fill="#fff" />
    </G>
  </Svg>
);

const SecurityIllustration = ({ color }: { color: string }) => (
  <Svg width={200} height={200} viewBox="0 0 200 200">
    {/* Shield */}
    <Path
      d="M 100 40 L 140 60 L 140 110 Q 140 150 100 170 Q 60 150 60 110 L 60 60 Z"
      fill={color}
      opacity="0.2"
    />
    <Path
      d="M 100 50 L 135 67 L 135 110 Q 135 145 100 162 Q 65 145 65 110 L 65 67 Z"
      fill={color}
    />
    {/* Check mark */}
    <Path
      d="M 85 105 L 95 115 L 120 85"
      stroke="#fff"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface Slide {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const slides: Slide[] = [
    {
      id: "1",
      title: "Track Your Finances",
      description:
        "Keep track of all your income, expenses, savings, and investments in one place",
      illustration: <WalletIllustration color={theme.colors.primary} />,
    },
    {
      id: "2",
      title: "Visual Reports",
      description:
        "Understand your spending patterns with beautiful charts and detailed analytics",
      illustration: <ChartIllustration color={theme.colors.primary} />,
    },
    {
      id: "3",
      title: "Set Budget Goals",
      description:
        "Create budgets for different categories and stay on track with your financial goals",
      illustration: <TargetIllustration color={theme.colors.primary} />,
    },
    {
      id: "4",
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and securely stored. Only you have access to your information",
      illustration: <SecurityIllustration color={theme.colors.primary} />,
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    navigation.replace("Login");
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@onboarding_complete", "true");
    navigation.replace("Login");
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationContainer}>{item.illustration}</View>
      <View style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          {item.title}
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        {currentIndex === slides.length - 1 ? (
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={scrollTo}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="arrow-right"
          >
            Next
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: "100%",
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default OnboardingScreen;
