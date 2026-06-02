import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { Card, LoadingView } from '../../components/ui';
import api from '../../lib/api';
import type { AnalyticsSummary } from '../../types';
import { colors } from '../../theme/colors';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const RATE_COLORS = ['#16a34a', '#dc2626'];

export default function AdminAnalyticsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/summary');
      return res.data as AnalyticsSummary;
    },
    refetchInterval: 10_000,
  });

  if (isLoading || !data) {
    return <LoadingView message="Loading analytics…" />;
  }

  const dailyData = data.visitsByDay.map((d) => ({
    value: d.count,
    label: d.date.slice(5),
    frontColor: colors.slate900,
  }));

  const weeklyData = data.visitsByWeek.map((d) => ({
    value: d.count,
    label: d.week.length > 8 ? d.week.slice(0, 8) : d.week,
    frontColor: colors.blue600,
  }));

  const rateData = [
    { value: data.approvalRate, color: RATE_COLORS[0], text: 'Approval' },
    { value: data.rejectionRate, color: RATE_COLORS[1], text: 'Rejection' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        <StatCard label="Total visitors" value={data.totalVisitors} />
        <StatCard label="Visitors today" value={data.visitorsToday} />
        <StatCard label="Approved" value={data.approvedVisitors} />
        <StatCard label="Rejected" value={data.rejectedVisitors} />
      </View>
      <View style={styles.grid}>
        <StatCard label="Pending" value={data.pending} />
        <StatCard label="On premises" value={data.onPremise} />
        <StatCard label="Approval rate" value={`${data.approvalRate}%`} />
        <StatCard label="Rejection rate" value={`${data.rejectionRate}%`} />
      </View>

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily visitors (last 7 days)</Text>
        {dailyData.length > 0 ? (
          <BarChart
            data={dailyData}
            barWidth={28}
            spacing={16}
            roundedTop
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            height={200}
          />
        ) : (
          <Text style={styles.muted}>No data yet</Text>
        )}
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly visitors (last month)</Text>
        {weeklyData.length > 0 ? (
          <BarChart
            data={weeklyData}
            barWidth={24}
            spacing={12}
            roundedTop
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            height={200}
          />
        ) : (
          <Text style={styles.muted}>No data yet</Text>
        )}
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Approval vs rejection rate</Text>
        <PieChart
          data={rateData}
          donut
          showText
          textColor={colors.slate900}
          radius={90}
          innerRadius={50}
        />
        <View style={styles.legend}>
          <Text style={styles.legendItem}>Approval: {data.approvalRate}%</Text>
          <Text style={styles.legendItem}>Rejection: {data.rejectionRate}%</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.chartTitle}>Frequent visitors</Text>
        {data.frequentVisitors.length === 0 ? (
          <Text style={styles.muted}>No data yet</Text>
        ) : (
          data.frequentVisitors.map((f) => (
            <View key={`${f.visitorName}-${f.visitorPhone}`} style={styles.freqRow}>
              <View>
                <Text style={styles.freqName}>{f.visitorName}</Text>
                <Text style={styles.freqPhone}>{f.visitorPhone}</Text>
              </View>
              <Text style={styles.freqCount}>{f.visitCount} visits</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
  },
  statLabel: { fontSize: 14, color: colors.slate500 },
  statValue: { fontSize: 24, fontWeight: '600', marginTop: 4 },
  chartCard: { alignItems: 'center', overflow: 'hidden' },
  chartTitle: { fontSize: 16, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 12 },
  muted: { color: colors.slate500, fontSize: 14 },
  legend: { marginTop: 12, alignSelf: 'flex-start' },
  legendItem: { fontSize: 14, color: colors.slate600 },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  freqName: { fontWeight: '500' },
  freqPhone: { fontSize: 12, color: colors.slate500 },
  freqCount: { fontWeight: '600' },
});
