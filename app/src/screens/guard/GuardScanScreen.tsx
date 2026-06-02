import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import StatusBadge from '../../components/StatusBadge';
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
import type { Visit } from '../../types';
import { colors } from '../../theme/colors';

export default function GuardScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<{ action: string; visit: Visit } | null>(null);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);

  async function processToken(token: string) {
    setError('');
    setResult(null);
    try {
      const res = await api.post('/visits/scan', { qrToken: token.trim() });
      setResult(res.data);
      setScanning(false);
      setScanned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    }
  }

  if (!permission) {
    return <Text style={styles.muted}>Checking camera permission…</Text>;
  }

  return (
    <View>
      <ScreenTitle title="Scan visitor QR" />

      <Card style={styles.scanCard}>
        {!permission.granted ? (
          <View>
            <Text style={styles.muted}>Camera permission is required to scan QR codes.</Text>
            <PrimaryButton title="Grant camera access" onPress={requestPermission} />
          </View>
        ) : scanning ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : ({ data }) => {
                      setScanned(true);
                      processToken(data);
                    }
              }
            />
            <SecondaryButton title="Stop camera" onPress={() => setScanning(false)} />
          </View>
        ) : (
          <PrimaryButton title="Start camera" onPress={() => { setScanned(false); setScanning(true); }} />
        )}

        <Label>Or paste QR token</Label>
        <Input
          value={manualToken}
          onChangeText={setManualToken}
          multiline
          numberOfLines={3}
          style={styles.tokenInput}
          placeholder="JWT token from QR"
        />
        <SecondaryButton title="Submit token" onPress={() => processToken(manualToken)} />
      </Card>

      {error ? <ErrorBanner message={error} /> : null}

      {result ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>
            {result.action === 'entry' ? 'Checked in' : 'Checked out'}
          </Text>
          <Text style={styles.successName}>{result.visit.visitorName}</Text>
          <StatusBadge status={result.visit.status} />
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.slate500, marginBottom: 12 },
  scanCard: { marginBottom: 16 },
  cameraWrap: { gap: 12 },
  camera: { width: '100%', height: 280, borderRadius: 8, overflow: 'hidden' },
  tokenInput: { minHeight: 80, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 },
  successCard: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  successTitle: { fontSize: 16, fontWeight: '600', color: '#14532d' },
  successName: { fontSize: 14, marginTop: 8, marginBottom: 8 },
});
