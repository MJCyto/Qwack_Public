import styled from "styled-components/native/dist/styled-components.native.esm";
import { ActivityIndicator, Dimensions, View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import React from "react";

import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
  initialWindowMetrics,
} from "react-native-safe-area-context";

export const Wrapper = styled(SafeAreaView)`
  background-color: ${props => props.color};
  height: ${Dimensions.get("window").height}px;
  flex: 1;
`;

export const ScreenWrapper = props => {
  const { colors } = useTheme();
  return (
    <Wrapper color={colors.background} {...props}>
      {props.children}
      {/*<TopFill color={colors.surface} />*/}
    </Wrapper>
  );
};

export const LoadingScreen = props => {
  const { colors } = useTheme();
  return (
    <ScreenWrapper>
      <View style={{ height: "100%", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.white, fontSize: 40, margin: 20 }}>Loading</Text>
        <ActivityIndicator size={70} color={"#fff"} />
      </View>
    </ScreenWrapper>
  );
};
