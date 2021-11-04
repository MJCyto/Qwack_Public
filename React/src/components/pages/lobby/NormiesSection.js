import { Text, View } from "react-native";
import PlayerTile from "./PlayerTile";
import { ScreenWrapper } from "../../common/screenComponents";
import React, { useMemo } from "react";
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
      <Text style={{ color, fontSize: 20, textAlign: "center", marginTop: 20 }}>{children}</Text>
      <HorizontalLine />
    </Wrapper>
  );
};

const NormiesSection = props => {
  const { colors } = useTheme();
  const { teams, isHost, gameCode } = props;

  const getTeam = useMemo(() => {
    if (!teams || !teams.blue || !teams.red) {
      return {
        blue: [],
        red: [],
      };
    }

    return {
      blue: teams.blue.filter(player => !player.isLeader),
      red: teams.red.filter(player => !player.isLeader),
    };
  }, [teams]);

  return (
    <>
      <GroupLabel color={colors.white}>Normies</GroupLabel>
      <View style={{ display: "flex", flexDirection: "row", marginTop: 15, marginBottom: 70 }}>
        {Object.keys(getTeam).map((teamName, index) => {
          // Each Team
          return (
            <View key={index} style={{ width: "50%" }}>
              {getTeam[teamName].map(player => (
                <PlayerTile
                  key={player.uid}
                  playerObj={player}
                  teamColor={teamName}
                  isHost={isHost}
                  gameCode={gameCode}
                />
              ))}
            </View>
          );
          // if (leader) {
          //   const color = index ? "red" : "blue";
          //   return (
          //     <PlayerTile
          //       key={index}
          //       playerObj={leader}
          //       teamColor={color}
          //       isHost={isHost}
          //       style={{ width: "50%" }}
          //     />
          //   );
          // }
          // return <View key={index} />;
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

export default NormiesSection;
