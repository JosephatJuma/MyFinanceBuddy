import { View, Text } from "react-native";
import React from "react";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
const HomeHeader = ({ props }) => {
  console.log(JSON.stringify(props?.route));
  const navigation = useNavigation();
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation?.openDrawer()} />
      <Appbar.Content title={props?.route?.name} />
    </Appbar.Header>
  );
};

export default HomeHeader;
