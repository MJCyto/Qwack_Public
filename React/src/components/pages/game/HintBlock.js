import React, { useState } from "react";
import styled from "styled-components/native/dist/styled-components.native.esm";
import { TextInput, useTheme } from "react-native-paper";
import { Button } from "../../common/formComponents";
import { Text } from "react-native";

const Wrapper = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  width: 100%;
`;

const HintBlock = props => {
  const { onSubmit, game, isSubmitting, errorMsg } = props;
  const { colors } = useTheme();

  const [hint, setHint] = useState("");
  const [numWords, setNumWords] = useState();
  return (
    <Wrapper>
      <Text style={{ color: colors.warning, fontSize: 15, padding: 5 }}>{errorMsg}</Text>

      <InputWrapper>
        <TextInput
          onChangeText={setHint}
          label="Hint"
          value={hint}
          style={{ flex: 2, height: 50 }}
        />
        <TextInput
          onChangeText={setNumWords}
          label="# of Words"
          value={numWords}
          style={{ flex: 1, height: 50 }}
        />
      </InputWrapper>
      <Button
        backgroundColor={colors.primary}
        color={"white"}
        label={"SEND"}
        onPress={() => onSubmit({ hint, numWords })}
        loading={isSubmitting}
        style={{ width: "100%" }}
      />
    </Wrapper>
  );
};

export default HintBlock;
