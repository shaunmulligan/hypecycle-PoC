import React from 'react';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import {Options, Option, StyledListItem, VerticalDivider} from './styles';
import {List} from 'react-native-paper';
import {View} from 'react-native';
import {SensorServiceIcons} from '../SensorServiceIcons';

export type SensorProps = {
  id: string;
  name: string;
  is_primary: boolean;
  sensorType: string[];
  type: string;
  address: string;
};

type Props = {
  data: SensorProps;
  onAction: () => void;
  actionIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  actionColor: string;
};

const Right =
  ({data, onAction, actionIcon, actionColor}: Props) =>
  () =>
    (
      <Options>
        <SensorServiceIcons data={data.sensorType} />
        <VerticalDivider />
        <Option onPress={onAction}>
          <MaterialCommunityIcons
            name={actionIcon}
            color={actionColor}
            size={20}
          />
        </Option>
      </Options>
    );

const Left = (Props: any) => <List.Icon {...Props} icon="bluetooth" />;

export function Sensor({data, onAction, actionIcon, actionColor}: Props) {
  return (
    <View>
      <StyledListItem
        title={data.name}
        description={data.address || data.id}
        left={Left}
        right={Right({data, onAction, actionIcon, actionColor})}
      />
    </View>
  );
}
