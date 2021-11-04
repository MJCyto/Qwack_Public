import { Text, View } from "react-native";
import PlayerTile from "./PlayerTile";
import { ScreenWrapper } from "../../common/screenComponents";
import React from "react";
import styled from "styled-components/native/dist/styled-components.native.esm";
import { useTheme } from "react-native-paper";

const GroupLabel = props => {
  const { color = "white", children } = props;

  const Wrapper = styled.View`
    width: 100%;
  `;
  const HorizontalLine = styled.View`
    width: 90%;
    height: 0;
    border: 1px solid white;
    align-self: center;
  `;

  return (
    <Wrapper>
      <Text style={{ color, fontSize: 20, textAlign: "center", marginTop: 10 }}>{children}</Text>
      <HorizontalLine />
    </Wrapper>
  );
};

const LeadersSection = props => {
  const { colors } = useTheme();
  const { teams, isHost, gameCode } = props;

  if (!teams || !teams.blue || !teams.red) {
    return <></>;
  }

  // console.log(teams.red);
  const leaders = [
    teams.blue.find(player => player.isLeader),
    teams.red.find(player => player.isLeader),
  ];
  // const blueLeader = teams.blue.find(player => player.isLeader);
  // const redLeader = teams.red.find(player => player.isLeader);

  return (
    <>
      <GroupLabel color={colors.white}>Leaders</GroupLabel>
      <View style={{ display: "flex", flexDirection: "row", marginTop: 15 }}>
        {leaders.map((leader, index) => {
          if (leader) {
            const color = index ? "red" : "blue";
            return (
              <View style={{ width: "50%" }}>
                <PlayerTile
                  key={index}
                  playerObj={leader}
                  teamColor={color}
                  isHost={isHost}
                  gameCode={gameCode}
                />
              </View>
            );
          }
          return <View key={index} />;
        })}
        {/*<PlayerTile*/}
        {/*  playerObj={blueLeader}*/}
        {/*  teamColor={"blue"}*/}
        {/*  isHost={isHost}*/}
        {/*  style={{ backgroundColor: colors.blue }}*/}
        {/*/>*/}
        {/*<PlayerTile*/}
        {/*  playerObj={redLeader}*/}
        {/*  teamColor={"red"}*/}
        {/*  isHost={isHost}*/}
        {/*  style={{ backgroundColor: colors.red }}*/}
        {/*/>*/}
      </View>
    </>
  );
};

export default LeadersSection;
