import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Footer from '../components/Footer';
import LogoMark from '../components/LogoMark';
import { Card, ErrorBanner, Input, Label, PrimaryButton, ScreenTitle } from '../components/ui';
import api from '../lib/api';
import { roleHome, setSession } from '../lib/auth';
import type { RootStackParamList } from '../navigation/types';
import type { User } from '../types';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data as { token: string; user: User };
      await setSession(token, user);
      navigation.reset({
        index: 0,
        routes: [{ name: roleHome(user.role) }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <LogoMark size={64} style={styles.logo} />
          <ScreenTitle title="Sign in" subtitle="Visitor Management System" />
          <Label>Email</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="guard@shuklamanya99.com"
          />
          <Label>Password</Label>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <ErrorBanner message={error} /> : null}
          <PrimaryButton
            title={loading ? 'Signing in…' : 'Sign in'}
            onPress={handleSubmit}
            disabled={!email || !password}
            loading={loading}
          />
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Demo accounts</Text>
            <Text style={styles.demoItem}>guard@shuklamanya99.com / guard123</Text>
            <Text style={styles.demoItem}>resident1@shuklamanya99.com / resident123</Text>
            <Text style={styles.demoItem}>resident2@shuklamanya99.com / resident123</Text>
          </View>
        </Card>
      </ScrollView>
      <Footer />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    paddingTop: 48,
  },
  card: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  logo: { alignSelf: 'center', marginBottom: 16 },
  demo: {
    marginTop: 24,
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 16,
  },
  demoTitle: { fontSize: 12, fontWeight: '600', color: colors.slate800 },
  demoItem: { fontSize: 12, color: colors.slate600, marginTop: 6 },
});
