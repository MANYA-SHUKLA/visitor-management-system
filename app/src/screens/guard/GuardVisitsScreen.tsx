import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VisitTable from '../../components/VisitTable';
import { LoadingView, ScreenTitle } from '../../components/ui';
import api from '../../lib/api';
import type { GuardStackParamList } from '../../navigation/types';
import type { Visit, VisitStatus } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardVisitsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();
  const [status, setStatus] = useState<VisitStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'guard', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
    refetchInterval: 10_000,
  });

  return (
    <View>
      <ScreenTitle title="Visitor status" />
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={status}
          onValueChange={(v) => setStatus(v as VisitStatus | '')}
        >
          <Picker.Item label="All statuses" value="" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Rejected" value="rejected" />
          <Picker.Item label="Entered" value="entered" />
          <Picker.Item label="Exited" value="exited" />
        </Picker>
      </View>
      {isLoading ? (
        <LoadingView />
      ) : (
        <VisitTable
          visits={data ?? []}
          onPressVisit={(id) => navigation.navigate('GuardVisitDetail', { id })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
});
