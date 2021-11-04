import { View, Text } from "react-native";
import React from "react";
import { Button } from "../formComponents";
import { useTheme } from "react-native-paper";

const LeaveGameModal = props => {
  const { onConfirm, onClose } = props;
  const { colors } = useTheme();

  return (
    <View style={{ width: "80%" }}>
      <Text style={{ fontSize: 30, marginBottom: 30, textAlign: "center", color: "white" }}>
        Are you sure you want to leave the game?
      </Text>
      <Button
        onPress={onConfirm}
        label={"Yes"}
        backgroundColor={colors.primary}
        color={`#fff`}
        style={{ marginTop: 10, marginBottom: 5 }}
      />
      <Button
        onPress={onClose}
        label={"Cancel"}
        backgroundColor={colors.accent}
        color={`#fff`}
        style={{ marginTop: 10, marginBottom: 20 }}
      />
    </View>
  );
};

export default LeaveGameModal;
