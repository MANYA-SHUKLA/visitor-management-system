import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VisitTable from '../../components/VisitTable';
import { Input, LoadingView, ScreenTitle } from '../../components/ui';
import api from '../../lib/api';
import type { AdminStackParamList } from '../../navigation/types';
import type { Visit, VisitStatus } from '../../types';
import { colors } from '../../theme/colors';

export default function AdminVisitsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const [apartment, setApartment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', 'admin', status, apartment],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (apartment) params.apartment = apartment;
      const res = await api.get('/visits', { params });
      return res.data.visits as Visit[];
    },
  });

  return (
    <View>
      <ScreenTitle title="All visits" />
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={status}
          onValueChange={(v) => setStatus(v as VisitStatus | '')}
        >
          <Picker.Item label="All statuses" value="" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Entered" value="entered" />
          <Picker.Item label="Exited" value="exited" />
          <Picker.Item label="Rejected" value="rejected" />
        </Picker>
      </View>
      <Input
        placeholder="Filter by apartment"
        value={apartment}
        onChangeText={setApartment}
      />
      {isLoading ? (
        <LoadingView />
      ) : (
        <VisitTable
          visits={data ?? []}
          onPressVisit={(id) => navigation.navigate('AdminVisitDetail', { id })}
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
    marginBottom: 12,
    overflow: 'hidden',
  },
});
