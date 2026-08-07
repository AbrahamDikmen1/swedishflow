import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export default function NordicWelcomeIllustration() {
  return (
    <View style={styles.container}>
      <Svg width="280" height="150" viewBox="0 0 280 150" fill="none">
        <Defs>
          {/* Soft central glow gradient fading seamlessly into white */}
          <RadialGradient id="centerAura" cx="140" cy="75" rx="130" ry="70" fx="140" fy="75" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#EFF5FC" stopOpacity="0.9" />
            <Stop offset="65%" stopColor="#F4F8FD" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>

          {/* Water gradient fading seamlessly at edges */}
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#D2E3F5" stopOpacity="0" />
            <Stop offset="18%" stopColor="#D2E3F5" stopOpacity="0.75" />
            <Stop offset="50%" stopColor="#C1D9F0" stopOpacity="0.9" />
            <Stop offset="82%" stopColor="#D8E7F8" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#D8E7F8" stopOpacity="0" />
          </LinearGradient>

          {/* Quay line gradient fading at edges */}
          <LinearGradient id="quayLineGrad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#B8D1EB" stopOpacity="0" />
            <Stop offset="20%" stopColor="#B8D1EB" stopOpacity="0.8" />
            <Stop offset="80%" stopColor="#B8D1EB" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#B8D1EB" stopOpacity="0" />
          </LinearGradient>

          {/* Connection Arc gradient */}
          <LinearGradient id="connectionGrad" x1="60" y1="50" x2="220" y2="50">
            <Stop offset="0%" stopColor="#1E4E8C" stopOpacity="0.15" />
            <Stop offset="50%" stopColor="#1E4E8C" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#1E4E8C" stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Soft background aura - blends smoothly into page white */}
        <Ellipse cx="140" cy="75" rx="130" ry="70" fill="url(#centerAura)" />

        {/* Subtle Swedish architectural skyline in background */}
        <G opacity="0.32">
          {/* Classic Swedish townhouse gables */}
          <Path d="M 32 105 L 32 74 L 42 65 L 52 74 L 52 105 Z" fill="#7DA2CF" />
          <Path d="M 52 105 L 52 68 L 66 56 L 80 68 L 80 105 Z" fill="#9BC2EC" />
          <Path d="M 80 105 L 80 78 L 91 70 L 102 78 L 102 105 Z" fill="#B2D1F2" />
          {/* Distant tower spire */}
          <Path d="M 172 105 L 172 60 L 178 42 L 184 60 L 184 105 Z" fill="#88AEDA" />
          {/* Waterfront buildings right */}
          <Path d="M 190 105 L 190 70 L 204 58 L 218 70 L 218 105 Z" fill="#9BC2EC" />
          <Path d="M 218 105 L 218 76 L 230 67 L 242 76 L 242 105 Z" fill="#B2D1F2" />
        </G>

        {/* Quay edge & water area with soft faded edges */}
        <Rect x="0" y="105" width="280" height="42" fill="url(#waterGrad)" />
        <Path d="M 0 105 L 280 105" stroke="url(#quayLineGrad)" strokeWidth="1.8" />

        {/* Gentle water reflections */}
        <Path d="M 35 119 C 55 117, 75 121, 95 119" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <Path d="M 115 127 C 135 125, 155 129, 175 127" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
        <Path d="M 185 117 C 205 115, 225 119, 245 117" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Warm dialogue flow arc connecting the two speakers */}
        <Path
          d="M 90 62 C 112 42, 168 42, 190 62"
          stroke="url(#connectionGrad)"
          strokeWidth="2.5"
          strokeDasharray="4 3"
          fill="none"
        />
        <Circle cx="140" cy="47" r="3.5" fill="#1E4E8C" opacity="0.4" />

        {/* Figure 1 (Left - Standing adult woman conversing) */}
        <G id="personLeft">
          <Ellipse cx="82" cy="107" rx="14" ry="3" fill="#1E4E8C" opacity="0.12" />
          {/* Head */}
          <Circle cx="82" cy="50" r="8.5" fill="#1E4E8C" />
          {/* Hair */}
          <Path d="M 74 50 C 74 41, 90 41, 90 50 C 90 54, 84 56, 82 56 C 77 56, 74 53, 74 50 Z" fill="#163B6B" />
          {/* Coat */}
          <Path d="M 72 63 C 72 59, 92 59, 92 63 L 90 88 L 74 88 Z" fill="#1E4E8C" />
          {/* Gesturing arm */}
          <Path d="M 85 67 C 95 71, 103 67, 108 63" stroke="#1E4E8C" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Trousers */}
          <Path d="M 75 88 L 76 106" stroke="#3366A3" strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M 88 88 L 87 106" stroke="#3366A3" strokeWidth="3.5" strokeLinecap="round" />
        </G>

        {/* Figure 2 (Right - Seated/standing adult man conversing) */}
        <G id="personRight">
          <Ellipse cx="198" cy="107" rx="16" ry="3" fill="#1E4E8C" opacity="0.12" />
          {/* Quay Bench */}
          <Path d="M 175 91 L 221 91" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 183 91 L 183 107" stroke="#64748B" strokeWidth="2" />
          <Path d="M 213 91 L 213 107" stroke="#64748B" strokeWidth="2" />

          {/* Head */}
          <Circle cx="198" cy="52" r="8.5" fill="#2B5E9E" />
          {/* Hair */}
          <Path d="M 190 50 C 191 42, 206 42, 207 50 L 190 50 Z" fill="#163B6B" />
          {/* Sweater */}
          <Path d="M 188 64 C 188 60, 208 60, 208 64 L 205 91 L 191 91 Z" fill="#2B5E9E" />
          {/* Arm */}
          <Path d="M 191 69 C 183 73, 175 69, 171 65" stroke="#2B5E9E" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <Path d="M 193 91 L 189 106" stroke="#1E4E8C" strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M 203 91 L 205 106" stroke="#1E4E8C" strokeWidth="3.5" strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

