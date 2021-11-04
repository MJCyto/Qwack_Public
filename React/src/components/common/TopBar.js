import React from "react";
import styled from "styled-components/native/dist/styled-components.native.esm";
import { useTheme } from "react-native-paper";

const Wrapper = styled.View`
  height: 40px;
  width: 100%;
  background-color: ${props => props.backgroundColor};
`;

const TopBar = props => {
  const { colors } = useTheme();
  return <Wrapper backgroundColor={colors.backdrop} />;
};

export default TopBar;
