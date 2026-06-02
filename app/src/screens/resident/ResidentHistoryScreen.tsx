import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VisitTable from '../../components/VisitTable';
import { LoadingView, ScreenTitle } from '../../components/ui';
import api from '../../lib/api';
import type { ResidentStackParamList } from '../../navigation/types';
import type { HistoryPeriod, Visit, VisitStatus } from '../../types';
import { colors } from '../../theme/colors';

export default function ResidentHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentStackParamList>>();
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const [period, setPeriod] = useState<HistoryPeriod>('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'resident-history', status, period],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (period) params.period = period;
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
  });

  return (
    <View>
      <ScreenTitle title="Visitor history" />
      <View style={styles.filters}>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={period}
            onValueChange={(v) => setPeriod(v as HistoryPeriod)}
          >
            <Picker.Item label="All time" value="" />
            <Picker.Item label="Today" value="today" />
            <Picker.Item label="Weekly" value="week" />
            <Picker.Item label="Monthly" value="month" />
          </Picker>
        </View>
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
      </View>
      {isLoading ? (
        <LoadingView />
      ) : (
        <VisitTable
          visits={data ?? []}
          onPressVisit={(id) => navigation.navigate('ResidentVisitDetail', { id })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 8, marginBottom: 16 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
