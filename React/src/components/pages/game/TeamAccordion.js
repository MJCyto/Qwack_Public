import { List, useTheme } from "react-native-paper";
import React from "react";
import styled from "styled-components";
import { Text } from "react-native";
import { getChosenWords } from "../../../selectors/gameSelectors";
import { connect } from "react-redux";

const WordListWrapper = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
`;

const WordWrapper = styled.View`
  flex-basis: 50%;
  align-items: center;
`;

const TeamAccordion = props => {
  const { color, items, title, expanded, onPress, chosenWords } = props;
  const { colors } = useTheme();

  const currentSelectedWords = chosenWords.filter(chosenWord => items.includes(chosenWord));

  return (
    <List.Accordion
      expanded={expanded}
      onPress={onPress}
      title={title}
      titleStyle={{ color: colors.white }}
      style={{ backgroundColor: colors.surface }}
    >
      <List.Section title={"Not yet chosen"}>
        <WordListWrapper>
          {items.map(
            word =>
              !chosenWords.includes(word) && (
                <WordWrapper key={word}>
                  <Text style={{ color, padding: 5, fontSize: 17 }}>{word}</Text>
                </WordWrapper>
              )
          )}
        </WordListWrapper>
      </List.Section>

      <List.Section title={"Chosen"}>
        <WordListWrapper>
          {currentSelectedWords.map(word => (
            <WordWrapper key={word}>
              <Text style={{ color, padding: 5, fontSize: 17 }}>{word}</Text>
            </WordWrapper>
          ))}
        </WordListWrapper>
      </List.Section>
    </List.Accordion>
  );
};

const mapStateToProps = state => ({
  chosenWords: getChosenWords(state),
});

export default connect(mapStateToProps)(TeamAccordion);
