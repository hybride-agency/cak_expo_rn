import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Screenshot_Logo_SVG from '../../assets/SVG/Screenshot_Logo_SVG';
import Info_Logo_SVG from '../../assets/SVG/Info_Logo_SVG';
import Danger_Logo_SVG from '../../assets/SVG/Danger_Logo_SVG';

interface PlanRulesCmpProps {
  rules?: string | null;
}

const PlanRulesCmp = ({ rules }: PlanRulesCmpProps) => {
  const rulesText = typeof rules === 'string' ? rules : '';
  const arrayRules = rulesText.split(/\r?\n/).filter(Boolean);

  if (!arrayRules.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {arrayRules.map((rule, index) => {
        const renderIcon = () => {
          if (index === 0) {
            return <Info_Logo_SVG />;
          } else if (index === 1) {
            return <Danger_Logo_SVG />;
          } else if (index === 2) {
            return <Screenshot_Logo_SVG />;
          }
        };
        return (
          <View key={rule + index} style={styles.ruleContainer}>
            {renderIcon()}
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  ruleText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Raleway-Light',
    includeFontPadding: false,
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 15,
  },
});

export default PlanRulesCmp;
