import React from "react";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../hooks";

const HomeHeader = ({ props }) => {
  const navigation = useNavigation();
  const { mainNavigator, theme } = useTheme();
  return (
    <Appbar.Header>
      {mainNavigator === "drawer" ? (
        <Appbar.Action icon="menu" onPress={() => navigation?.openDrawer()} />
      ) : (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      <Appbar.Content title={props?.route?.name} />
    </Appbar.Header>
  );
};

export default HomeHeader;
