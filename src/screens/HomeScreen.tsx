import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { GATES } from '../data/gates';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { sunLongitude, moonLongitude, julianDay } from '../utils/ephemeris';
import { longitudeToGate } from '../utils/humanDesign';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'profile') => void;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 5) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function HomeScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart, stats, getLevelTitle } = useTasarimStore();

  const today = useMemo(() => {
    const jd = julianDay(new Date());
    const sunLon = sunLongitude(jd);
    const moonLon = moonLongitude(jd);
    const sun = longitudeToGate(sunLon);
    const moon = longitudeToGate(moonLon);
    return {
      sunGate: sun.gate,
      sunLine: sun.line,
      moonGate: moon.gate,
      moonLine: moon.line,
    };
  }, []);

  if (!activeProfile) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.emptyMedallion}>✦</Text>
        <Text style={styles.emptyTitle}>Sakin Tasarım'a Hoşgeldin</Text>
        <Text style={styles.emptyDesc}>
          Doğum gün, saat ve şehrini girerek kendine özel Human Design haritanı oluştur.
          Sana ait olanı, ait olmayandan ayırt etmenin yolculuğu.
        </Text>
        <TouchableOpacity
          style={styles.emptyCTA}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyCTAText}>Profili Oluştur →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = chart ? TYPES[chart.type] : null;
  const a = chart ? AUTHORITIES[chart.authority] : null;
  const sunGateInfo = GATES[today.sunGate];
  const moonGateInfo = GATES[today.moonGate];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {greetingByHour()}, {activeProfile.name}
        </Text>
        <Text style={styles.subGreeting}>
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
        </Text>
      </View>

      {/* Kullanıcı haritası özet kartı */}
      {chart && t && a && (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => onNavigate('chart')}
          activeOpacity={0.9}
        >
          <Text style={styles.heroEmoji}>{t.emoji}</Text>
          <Text style={styles.heroLabel}>SENİN TASARIMIN</Text>
          <Text style={styles.heroType}>{chart.type}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>STRATEJİ</Text>
              <Text style={styles.heroColValue}>{chart.strategy}</Text>
            </View>
            <View style={styles.heroSep} />
            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>YETKİ</Text>
              <Text style={styles.heroColValue}>{a.name.replace(' Yetki', '')}</Text>
            </View>
            <View style={styles.heroSep} />
            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>PROFİL</Text>
              <Text style={styles.heroColValue}>{chart.profile}</Text>
            </View>
          </View>
          <Text style={styles.heroCTA}>Tam haritayı gör →</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Bugünün Transiti</Text>
      <Text style={styles.sectionDesc}>
        Güneş ve Ay'ın bugün aktive ettiği kapılar, kollektif alanın ortak temasıdır.
      </Text>

      <View style={styles.transitGrid}>
        <View style={[styles.transitCard, { borderColor: Colors.gold + '50' }]}>
          <Text style={styles.transitEmoji}>☉</Text>
          <Text style={styles.transitLabel}>GÜNEŞ KAPISI</Text>
          <Text style={[styles.transitGate, { color: Colors.gold }]}>
            Kapı {today.sunGate}.{today.sunLine}
          </Text>
          <Text style={styles.transitName}>{sunGateInfo.name}</Text>
          <Text style={styles.transitTheme}>{sunGateInfo.theme}</Text>
          <View style={styles.transitDivider} />
          <Text style={styles.transitMicroLabel}>Hediye</Text>
          <Text style={styles.transitMicro}>{sunGateInfo.gift}</Text>
          <Text style={styles.transitMicroLabel}>Gölge</Text>
          <Text style={styles.transitMicro}>{sunGateInfo.shadow}</Text>
        </View>

        <View style={[styles.transitCard, { borderColor: Colors.purple + '50' }]}>
          <Text style={styles.transitEmoji}>☽</Text>
          <Text style={styles.transitLabel}>AY KAPISI</Text>
          <Text style={[styles.transitGate, { color: Colors.purpleSoft }]}>
            Kapı {today.moonGate}.{today.moonLine}
          </Text>
          <Text style={styles.transitName}>{moonGateInfo.name}</Text>
          <Text style={styles.transitTheme}>{moonGateInfo.theme}</Text>
          <View style={styles.transitDivider} />
          <Text style={styles.transitMicroLabel}>Hediye</Text>
          <Text style={styles.transitMicro}>{moonGateInfo.gift}</Text>
          <Text style={styles.transitMicroLabel}>Gölge</Text>
          <Text style={styles.transitMicro}>{moonGateInfo.shadow}</Text>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{stats.totalOpens}</Text>
          <Text style={styles.statLabel}>Toplam Açılış</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{stats.streak}🔥</Text>
          <Text style={styles.statLabel}>Süreklilik</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{getLevelTitle(stats.level)}</Text>
          <Text style={styles.statLabel}>Seviye {stats.level}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => onNavigate('chart')}
        activeOpacity={0.85}
      >
        <Text style={styles.linkEmoji}>✦</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.linkTitle}>Tam Haritan</Text>
          <Text style={styles.linkDesc}>Bodygraph, merkezler, kanallar ve detaylı rapor</Text>
        </View>
        <Text style={styles.linkArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: Spacing.xl,
  },
  emptyMedallion: {
    fontSize: 64, color: Colors.gold, marginBottom: Spacing.lg, opacity: 0.85,
  },
  emptyTitle: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.xl,
  },
  emptyCTA: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  emptyCTAText: {
    color: Colors.background,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },

  header: { marginBottom: Spacing.lg },
  greeting: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  subGreeting: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    alignItems: 'center',
    ...Shadows.gold,
  },
  heroEmoji: { fontSize: 40, marginBottom: 4 },
  heroLabel: {
    fontSize: Typography.size.xs,
    letterSpacing: Typography.letterSpacing.wider,
    color: Colors.gold,
    marginBottom: 4,
  },
  heroType: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    fontWeight: Typography.weight.bold,
  },
  heroDivider: {
    height: 1, backgroundColor: Colors.divider,
    width: '60%', marginVertical: Spacing.md,
  },
  heroRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between' },
  heroCol: { flex: 1, alignItems: 'center' },
  heroSep: { width: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.sm },
  heroColLabel: {
    fontSize: 9, letterSpacing: 1.2, color: Colors.textMuted, marginBottom: 4,
  },
  heroColValue: {
    fontSize: Typography.size.sm, color: Colors.text, textAlign: 'center',
  },
  heroCTA: {
    marginTop: Spacing.md,
    color: Colors.gold,
    fontSize: Typography.size.sm,
  },

  sectionTitle: {
    fontSize: Typography.size.lg,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: Typography.size.sm * 1.5,
  },

  transitGrid: { gap: Spacing.md, marginBottom: Spacing.xl },
  transitCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  transitEmoji: { fontSize: 28, marginBottom: 4 },
  transitLabel: {
    fontSize: 10, letterSpacing: 1.5,
    color: Colors.textMuted, marginBottom: 4,
  },
  transitGate: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.font.serif,
    fontWeight: Typography.weight.bold,
    marginBottom: 2,
  },
  transitName: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
    marginBottom: 4,
  },
  transitTheme: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.5,
  },
  transitDivider: {
    height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md,
  },
  transitMicroLabel: {
    fontSize: 9, letterSpacing: 1.2, color: Colors.textMuted, marginTop: 4,
  },
  transitMicro: {
    fontSize: Typography.size.sm, color: Colors.text, marginBottom: 4,
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statSep: { width: 1, backgroundColor: Colors.divider },
  statValue: {
    fontSize: Typography.size.lg,
    color: Colors.text,
    fontWeight: Typography.weight.bold,
    fontFamily: Typography.font.serif,
  },
  statLabel: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted,
    marginTop: 2,
  },

  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.purple + '30',
  },
  linkEmoji: {
    fontSize: 28, color: Colors.purpleSoft, marginRight: Spacing.md,
  },
  linkTitle: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  linkDesc: {
    fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 2,
  },
  linkArrow: { fontSize: 20, color: Colors.purpleSoft, marginLeft: Spacing.md },
});
