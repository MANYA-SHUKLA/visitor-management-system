import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Card,
  ErrorBanner,
  Input,
  Label,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
} from '../../components/ui';
import api from '../../lib/api';
import { isValidPhone, PHONE_LENGTH, sanitizePhone } from '../../lib/phone';
import type { GuardStackParamList } from '../../navigation/types';
import type { User } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardRegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [apartment, setApartment] = useState('');
  const [expectedAt, setExpectedAt] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const res = await api.get('/residents');
      return res.data.residents as User[];
    },
  });

  async function handleSubmit() {
    setError('');
    if (!isValidPhone(visitorPhone)) {
      setError(`Phone must be exactly ${PHONE_LENGTH} digits`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/visits', {
        visitorName,
        visitorPhone,
        purpose,
        apartment,
        expectedAt: expectedAt?.toISOString(),
      });
      navigation.navigate('GuardVisitDetail', { id: res.data.visit._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <ScreenTitle
        title="Register visitor"
        subtitle="The resident will receive an approval request."
      />
      <Card>
        <Label>Visitor name</Label>
        <Input value={visitorName} onChangeText={setVisitorName} />
        <Label>Phone</Label>
        <Input
          value={visitorPhone}
          onChangeText={(text) => setVisitorPhone(sanitizePhone(text))}
          keyboardType="number-pad"
          maxLength={PHONE_LENGTH}
          placeholder="10-digit mobile number"
        />
        <Label>Purpose</Label>
        <Input
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Delivery, guest, maintenance…"
        />
        <Label>Resident flat number</Label>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={apartment}
            onValueChange={(v) => setApartment(v)}
          >
            <Picker.Item label="Select apartment" value="" />
            {residents?.map((r) => (
              <Picker.Item
                key={r._id}
                label={`${r.apartment} — ${r.name}`}
                value={r.apartment ?? ''}
              />
            ))}
          </Picker>
        </View>
        <Label>Expected time (optional)</Label>
        <SecondaryButton
          title={
            expectedAt
              ? expectedAt.toLocaleString()
              : 'Pick date & time'
          }
          onPress={() => setShowPicker(true)}
        />
        {showPicker && (
          <DateTimePicker
            value={expectedAt ?? new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setShowPicker(Platform.OS === 'ios');
              if (date) setExpectedAt(date);
            }}
          />
        )}
        {error ? <ErrorBanner message={error} /> : null}
        <PrimaryButton
          title={loading ? 'Submitting…' : 'Submit for approval'}
          onPress={handleSubmit}
          loading={loading}
          disabled={
            !visitorName ||
            !isValidPhone(visitorPhone) ||
            !purpose ||
            !apartment
          }
        />
      </Card>
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
