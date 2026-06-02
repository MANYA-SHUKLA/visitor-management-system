import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Bootstrap: undefined;
  Login: undefined;
  Guard: NavigatorScreenParams<GuardStackParamList>;
  Resident: NavigatorScreenParams<ResidentStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

export type GuardStackParamList = {
  GuardDashboard: undefined;
  GuardRegister: undefined;
  GuardVisits: undefined;
  GuardVisitDetail: { id: string };
  GuardEntryExit: undefined;
  GuardScan: undefined;
};

export type ResidentStackParamList = {
  ResidentApprovals: undefined;
  ResidentHistory: undefined;
  ResidentVisitDetail: { id: string };
};

export type AdminStackParamList = {
  AdminAnalytics: undefined;
  AdminVisits: undefined;
  AdminVisitDetail: { id: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type GuardScreenProps<T extends keyof GuardStackParamList> =
  NativeStackScreenProps<GuardStackParamList, T>;

export type ResidentScreenProps<T extends keyof ResidentStackParamList> =
  NativeStackScreenProps<ResidentStackParamList, T>;

export type AdminScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>;
