import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path } from "react-native-svg";
import type { ProgressPhotoPose } from "../../types/plans";

const GUIDE_LINE = "#3A3A3A";
const SILHOUETTE = "#2F2F2F";
const SILHOUETTE_EDGE = "#454545";
const LABEL = "#7A7A7A";

/**
 * Reference outline with the guiding lines the user lines themselves up
 * against. Top line is the eyes (ears from behind), lower line the hips.
 */
const PoseGuide = ({ pose }: { pose: ProgressPhotoPose }) => {
  const topLabel = pose === "back" ? "Ears" : "Eyes";
  const isSide = pose === "left_side" || pose === "right_side";

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 220 260">
        <Line x1="110" y1="0" x2="110" y2="260" stroke={GUIDE_LINE} strokeWidth="1" />
        <Line x1="10" y1="52" x2="210" y2="52" stroke={GUIDE_LINE} strokeWidth="1" />
        <Line x1="10" y1="182" x2="210" y2="182" stroke={GUIDE_LINE} strokeWidth="1" />

        {isSide ? (
          <>
            <Circle cx="110" cy="46" r="23" fill={SILHOUETTE} stroke={SILHOUETTE_EDGE} />
            <Ellipse cx="118" cy="52" rx="12" ry="18" fill={SILHOUETTE} />
            <Path
              d="M108 70 C96 72 90 84 90 102 L88 156 L128 156 L126 102 C126 84 120 72 108 70 Z"
              fill={SILHOUETTE}
              stroke={SILHOUETTE_EDGE}
            />
            <Path d="M96 100 L88 148 L98 176 L108 172 L100 148 L108 116 Z" fill={SILHOUETTE} />
            <Path d="M88 156 L130 156 L134 210 L92 210 Z" fill={SILHOUETTE} stroke={SILHOUETTE_EDGE} />
            <Path d="M96 210 L128 210 L120 252 L96 252 Z" fill={SILHOUETTE} />
          </>
        ) : (
          <>
            <Circle cx="110" cy="46" r="24" fill={SILHOUETTE} stroke={SILHOUETTE_EDGE} />
            <Path
              d="M110 72 C88 72 74 84 72 104 L66 156 L154 156 L148 104 C146 84 132 72 110 72 Z"
              fill={SILHOUETTE}
              stroke={SILHOUETTE_EDGE}
            />
            <Path d="M74 100 L46 132 L58 174 L70 172 L62 136 L84 116 Z" fill={SILHOUETTE} />
            <Path d="M146 100 L174 132 L162 174 L150 172 L158 136 L136 116 Z" fill={SILHOUETTE} />
            <Path
              d="M68 156 L152 156 L148 212 L118 212 L110 178 L102 212 L72 212 Z"
              fill={SILHOUETTE}
              stroke={SILHOUETTE_EDGE}
            />
            <Path d="M74 212 L100 212 L98 252 L78 252 Z" fill={SILHOUETTE} />
            <Path d="M120 212 L146 212 L142 252 L122 252 Z" fill={SILHOUETTE} />
          </>
        )}
      </Svg>

      <Text style={[styles.guideLabel, styles.topLabel]}>{topLabel}</Text>
      <Text style={[styles.guideLabel, styles.hipLabel]}>Hips</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: 220 / 260, position: "relative" },
  guideLabel: {
    position: "absolute",
    right: 6,
    color: LABEL,
    fontSize: 11,
    fontFamily: "Raleway-Medium",
  },
  topLabel: { top: "13%" },
  hipLabel: { top: "63%" },
});

export default PoseGuide;
