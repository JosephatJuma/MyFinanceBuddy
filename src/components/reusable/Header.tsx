import { View, Text } from "react-native";
import React from "react";
import { Appbar, AppbarProps } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
interface HeaderProps extends AppbarProps {
  title: string;
  children?: React.ReactNode;
}
const Header = ({ title, children }: HeaderProps) => {
  const navigation = useNavigation();
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content
        title={title}
        titleStyle={{ fontWeight: "600", fontSize: 20 }}
      />
      {children && children}
    </Appbar.Header>
  );
};

export default Header;
