import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { Bodygraph } from '../components/Bodygraph';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { PROFILES, LINES } from '../data/profiles';
import { CENTERS, CenterKey, CENTER_ORDER } from '../data/centers';
import { GATES } from '../data/gates';
import { getActivationsByCenter, planetLabel } from '../utils/humanDesign';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'report' | 'profile') => void;
}

type Tab = 'overview' | 'centers' | 'gates' | 'planets';

export function ChartScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [openCenter, setOpenCenter] = useState<CenterKey | null>(null);

  if (!activeProfile || !chart) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.emptyMedallion}>✦</Text>
        <Text style={styles.emptyTitle}>Henüz harita yok</Text>
        <Text style={styles.emptyDesc}>
          Önce profilini oluştur. Doğum bilgilerin olmadan harita çizilemez.
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

  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];
  const personalityProfile = chart.personality.find(x => x.planet === 'sun')!;
  const designProfile = chart.design.find(x => x.planet === 'sun')!;
  // PROFILES sadece 12 klasik kombinasyonu içerir; 36 line çifti mümkün
  // olduğu için fallback olarak çizgi adlarından birleştirilmiş ad üretiyoruz.
  const p = PROFILES[chart.profile] ?? {
    key: chart.profile,
    name: `${LINES[personalityProfile.line].name} / ${LINES[designProfile.line].name}`,
    theme: '',
    shortDesc: `${LINES[personalityProfile.line].shortDesc}`,
    longDesc:
      `Bilinçli çizgi ${personalityProfile.line}. ${LINES[personalityProfile.line].name}: ` +
      `${LINES[personalityProfile.line].shortDesc} ` +
      `Bilinçsiz çizgi ${designProfile.line}. ${LINES[designProfile.line].name}: ` +
      `${LINES[designProfile.line].shortDesc}`,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {
        paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl,
      }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerLabel}>HARİTA</Text>
      <Text style={styles.headerName}>{activeProfile.name}</Text>
      <Text style={styles.headerMeta}>
        {activeProfile.birthDate} · {activeProfile.birthTime} · {activeProfile.city.name}
      </Text>

      <View style={styles.bodygraphWrap}>
        <Bodygraph chart={chart} size={280} />
      </View>

      {/* Tab başlıkları */}
      <View style={styles.tabs}>
        {([
          { k: 'overview', l: 'Özet' },
          { k: 'centers', l: 'Merkezler' },
          { k: 'gates', l: 'Kapılar' },
          { k: 'planets', l: 'Gezegenler' },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.k}
            style={[styles.tab, tab === t.k && styles.tabActive]}
            onPress={() => setTab(t.k)}
          >
            <Text style={[styles.tabText, tab === t.k && styles.tabTextActive]}>
              {t.l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' && (
        <View>
          {/* Tek hero özet */}
          <View style={styles.heroSummary}>
            <Text style={styles.heroEmoji}>{t.emoji}</Text>
            <Text style={styles.heroType}>{chart.type}</Text>
            <Text style={styles.heroStrategy}>{chart.strategy}</Text>
            <View style={styles.heroDivider} />
            <KeyVal k="Profil" v={`${chart.profile} — ${p.name}`} />
            <KeyVal k="İçsel Yetki" v={a.name} />
            <KeyVal k="Tanım" v={chart.definition} />
            <KeyVal k="Doğru Frekans" v={chart.signature} />
            <KeyVal k="Yanlış Frekans" v={chart.notSelf} />
          </View>

          {/* Açılır/kapanır detaylar */}
          <Expandable
            title="Tipini anla"
            kicker="STRATEJİ"
          >
            <Text style={styles.cardBody}>{t.longDesc}</Text>
            <View style={styles.bullets}>
              {t.pracicalTips.map((tip, i) => (
                <Text key={i} style={styles.bullet}>•  {tip}</Text>
              ))}
            </View>
          </Expandable>

          <Expandable
            title="Yetkin nasıl karar verir"
            kicker={a.name.toLocaleUpperCase('tr')}
          >
            <Text style={styles.cardBody}>{a.shortDesc}</Text>
            <View style={styles.bullets}>
              {a.howToDecide.map((tip, i) => (
                <Text key={i} style={styles.bullet}>•  {tip}</Text>
              ))}
            </View>
            {!!a.caution && (
              <Text style={styles.cardCaution}>! {a.caution}</Text>
            )}
          </Expandable>

          <Expandable
            title="Profil çizgilerin"
            kicker={`${chart.profile} — ${p.name.toLocaleUpperCase('tr')}`}
          >
            <Text style={styles.cardBody}>{p.longDesc}</Text>
            <Text style={styles.cardSubLabel}>Bilinçli (Personality Sun)</Text>
            <Text style={styles.cardBody}>
              {personalityProfile.line}. {LINES[personalityProfile.line].name} —{' '}
              {LINES[personalityProfile.line].shortDesc}
            </Text>
            <Text style={styles.cardSubLabel}>Bilinçsiz (Design Sun)</Text>
            <Text style={styles.cardBody}>
              {designProfile.line}. {LINES[designProfile.line].name} —{' '}
              {LINES[designProfile.line].shortDesc}
            </Text>
          </Expandable>

          {/* Aktif kanallar — kompakt */}
          <View style={styles.channelsBlock}>
            <Text style={styles.cardKicker}>
              AKTİF KANALLAR · {chart.activeChannels.length}
            </Text>
            {chart.activeChannels.length === 0 ? (
              <Text style={styles.cardBody}>
                Tanımlı kanalın yok — Reflektör doğası. Çevren senin aynan.
              </Text>
            ) : chart.activeChannels.map(c => (
              <View key={c.id} style={styles.channelRow}>
                <Text style={styles.channelId}>{c.id}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelName}>{c.name}</Text>
                  <Text style={styles.channelDesc}>{c.shortDesc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Inkarnasyon haçı — tek satır footer */}
          <Text style={styles.crossFooter}>
            İnkarnasyon Haçı · {chart.incarnationCross}
          </Text>
        </View>
      )}

      {tab === 'centers' && (
        <View>
          <Text style={styles.tabHelper}>
            Tanımlı merkezler senin sabit, güvenilir frekansındır. Tanımsız merkezler ise
            başkalarından örneklediğin alanlardır — yanlış benliğin tuzakları burada;
            bilgelik de burada birikir.
          </Text>
          {CENTER_ORDER.map(k => {
            const c = CENTERS[k];
            const isDef = chart.definedCenters.has(k);
            const isOpen = openCenter === k;
            const acts = getActivationsByCenter(chart, k);
            return (
              <TouchableOpacity
                key={k}
                style={[styles.centerCard, isDef && { borderColor: c.color + '60' }]}
                onPress={() => setOpenCenter(isOpen ? null : k)}
                activeOpacity={0.85}
              >
                <View style={styles.centerHead}>
                  <View style={[styles.centerDot, { backgroundColor: isDef ? c.color : 'transparent', borderColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.centerName}>{c.emoji} {c.name}</Text>
                    <Text style={[styles.centerStatus, { color: isDef ? Colors.gold : Colors.textMuted }]}>
                      {isDef ? 'TANIMLI' : 'TANIMSIZ'} · {c.bio}
                    </Text>
                  </View>
                  <Text style={styles.centerChev}>{isOpen ? '−' : '+'}</Text>
                </View>
                {isOpen && (
                  <View style={styles.centerBody}>
                    <Text style={styles.cardSubLabel}>İşlev</Text>
                    <Text style={styles.cardBody}>{c.function}</Text>

                    <Text style={styles.cardSubLabel}>
                      {isDef ? c.defined.title : c.undefined.title}
                    </Text>
                    <Text style={styles.cardBody}>
                      {isDef ? c.defined.desc : c.undefined.desc}
                    </Text>

                    {isDef ? (
                      <>
                        <Text style={styles.cardSubLabel}>Hediyeler</Text>
                        {c.defined.gifts.map((g, i) => (
                          <Text key={i} style={styles.bullet}>•  {g}</Text>
                        ))}
                      </>
                    ) : (
                      <>
                        <Text style={styles.cardSubLabel}>Yanlış Benlik Sorusu</Text>
                        <Text style={styles.cardBody}>{c.undefined.notSelfQuestion}</Text>
                        <Text style={styles.cardSubLabel}>Kazanılan Bilgelik</Text>
                        <Text style={styles.cardBody}>{c.undefined.wisdom}</Text>
                      </>
                    )}

                    {(acts.personality.length > 0 || acts.design.length > 0) && (
                      <>
                        <Text style={styles.cardSubLabel}>Bu merkezdeki aktivasyonların</Text>
                        {acts.personality.map(act => (
                          <Text key={'p' + act.planet} style={styles.activationLine}>
                            <Text style={{ color: Colors.text }}>● </Text>
                            {planetLabel(act.planet)} · {GATES[act.gate].name}{' '}
                            <Text style={{ color: Colors.gold }}>{act.gate}.{act.line}</Text>
                          </Text>
                        ))}
                        {acts.design.map(act => (
                          <Text key={'d' + act.planet} style={styles.activationLine}>
                            <Text style={{ color: Colors.ember }}>● </Text>
                            {planetLabel(act.planet)} · {GATES[act.gate].name}{' '}
                            <Text style={{ color: Colors.ember }}>{act.gate}.{act.line}</Text>
                          </Text>
                        ))}
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {tab === 'gates' && (
        <View>
          <Text style={styles.tabHelper}>
            Aktif kapıların: {chart.activeGates.size} / 64. Bilinçli (siyah) kapılar
            farkındalığında, bilinçsiz (kırmızı) kapılar ise bedensel/genetik mirasında.
          </Text>
          {Array.from(chart.activeGates).sort((a, b) => a - b).map(g => {
            const info = GATES[g];
            const inP = chart.personalityGates.has(g);
            const inD = chart.designGates.has(g);
            const dot =
              inP && inD ? Colors.gold :
              inP ? '#FFFFFF' : Colors.ember;
            const tag =
              inP && inD ? 'Bilinçli + Bilinçsiz' :
              inP ? 'Bilinçli' : 'Bilinçsiz';
            return (
              <View key={g} style={styles.gateCard}>
                <View style={styles.gateHead}>
                  <View style={[styles.gateDot, { backgroundColor: dot }]} />
                  <Text style={styles.gateNum}>{g}</Text>
                  <Text style={styles.gateName}>{info.name}</Text>
                  <Text style={styles.gateCenter}>{CENTERS[info.center].emoji}</Text>
                </View>
                <Text style={styles.gateTheme}>{info.theme}</Text>
                <View style={styles.gateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>HEDİYE</Text>
                    <Text style={styles.miniValue}>{info.gift}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>GÖLGE</Text>
                    <Text style={styles.miniValue}>{info.shadow}</Text>
                  </View>
                </View>
                <Text style={styles.gateTag}>{tag}</Text>
              </View>
            );
          })}
        </View>
      )}

      {tab === 'planets' && (
        <View>
          <Text style={styles.tabHelper}>
            13 gezegenin doğum (bilinçli) ve doğumdan ~88 gün önceki (bilinçsiz)
            pozisyonları. Sol sütun bilinçli, sağ sütun bilinçsizdir.
          </Text>
          <View style={styles.planetTable}>
            <View style={styles.planetHead}>
              <Text style={[styles.planetCell, styles.planetHeadText, { flex: 1.2 }]}>Gezegen</Text>
              <Text style={[styles.planetCell, styles.planetHeadText, { color: Colors.text }]}>● Bilinçli</Text>
              <Text style={[styles.planetCell, styles.planetHeadText, { color: Colors.ember }]}>● Bilinçsiz</Text>
            </View>
            {chart.personality.map((act, idx) => {
              const d = chart.design[idx];
              return (
                <View key={act.planet} style={styles.planetRow}>
                  <Text style={[styles.planetCell, { flex: 1.2, color: Colors.text }]}>
                    {planetLabel(act.planet)}
                  </Text>
                  <Text style={styles.planetCell}>
                    <Text style={{ color: Colors.gold }}>{act.gate}.{act.line}</Text>{'\n'}
                    <Text style={styles.planetGateName}>{GATES[act.gate].name}</Text>
                  </Text>
                  <Text style={styles.planetCell}>
                    <Text style={{ color: Colors.ember }}>{d.gate}.{d.line}</Text>{'\n'}
                    <Text style={styles.planetGateName}>{GATES[d.gate].name}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function SectionCard({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <View style={[scStyles.card, { borderLeftColor: accent }]}>
      {children}
    </View>
  );
}

function Expandable({
  title, kicker, children,
}: { title: string; kicker?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={expStyles.card}>
      <TouchableOpacity
        style={expStyles.head}
        onPress={() => setOpen(!open)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
      >
        <View style={{ flex: 1 }}>
          {!!kicker && <Text style={expStyles.kicker}>{kicker}</Text>}
          <Text style={expStyles.title}>{title}</Text>
        </View>
        <Text style={expStyles.chev}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>
      {open && <View style={expStyles.body}>{children}</View>}
    </View>
  );
}

function KeyVal({ k, v }: { k: string; v: string }) {
  return (
    <View style={kvStyles.row}>
      <Text style={kvStyles.k}>{k}</Text>
      <Text style={kvStyles.v}>{v}</Text>
    </View>
  );
}

const scStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    ...Shadows.card,
  },
});

const expStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  kicker: {
    fontSize: 10, letterSpacing: 1.4, color: Colors.gold,
  },
  title: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  chev: {
    fontSize: 22, color: Colors.textMuted, marginLeft: Spacing.md,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
});

const kvStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  k: { fontSize: Typography.size.sm, color: Colors.textMuted, letterSpacing: 0.6 },
  v: { fontSize: Typography.size.sm, color: Colors.text, fontWeight: Typography.weight.medium, maxWidth: '60%', textAlign: 'right' },
});

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
    fontSize: Typography.size.xxl, color: Colors.text, marginBottom: Spacing.md,
    fontFamily: Typography.font.serif,
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6, marginBottom: Spacing.xl,
  },
  emptyCTA: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  emptyCTAText: {
    color: Colors.background, fontWeight: Typography.weight.bold, fontSize: Typography.size.md,
  },

  headerLabel: {
    fontSize: 10, letterSpacing: 2, color: Colors.gold, marginBottom: 4,
  },
  headerName: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  headerMeta: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
  },

  bodygraphWrap: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.round,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: BorderRadius.round,
  },
  tabActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  tabText: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text, fontWeight: Typography.weight.semibold,
  },

  cardKicker: {
    fontSize: 10, letterSpacing: 1.5, color: Colors.gold, marginBottom: 4,
  },
  heroSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    ...Shadows.gold,
  },
  heroEmoji: { fontSize: 44, marginBottom: 4 },
  heroType: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    fontWeight: Typography.weight.bold,
  },
  heroStrategy: {
    fontSize: Typography.size.sm,
    color: Colors.gold,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '60%',
    marginVertical: Spacing.md,
    alignSelf: 'center',
  },
  channelsBlock: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  crossFooter: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontStyle: 'italic',
    lineHeight: Typography.size.xs * 1.6,
  },
  cardTitle: {
    fontSize: Typography.size.xl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: Spacing.sm,
  },
  cardBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6, marginBottom: Spacing.sm,
  },
  cardSubLabel: {
    fontSize: 10, letterSpacing: 1.2, color: Colors.textMuted,
    marginTop: Spacing.sm, marginBottom: 4,
  },
  cardCaution: {
    fontSize: Typography.size.sm, color: Colors.emberSoft,
    marginTop: Spacing.sm, fontStyle: 'italic',
  },
  bullets: { marginTop: 4 },
  bullet: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.5, marginBottom: 2,
  },

  channelRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  channelId: {
    fontSize: Typography.size.md,
    color: Colors.gold,
    fontFamily: Typography.font.serif,
    width: 56,
  },
  channelName: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  channelDesc: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginTop: 2,
  },
  channelMeta: {
    fontSize: 10, color: Colors.textMuted, marginTop: 4, letterSpacing: 0.6,
  },

  tabHelper: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    lineHeight: Typography.size.sm * 1.5,
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },

  centerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  centerHead: {
    flexDirection: 'row', alignItems: 'center',
  },
  centerDot: {
    width: 14, height: 14, borderRadius: 999,
    borderWidth: 1.4, marginRight: Spacing.md,
  },
  centerName: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  centerStatus: {
    fontSize: 10, letterSpacing: 1.2, marginTop: 2,
  },
  centerChev: {
    fontSize: 22, color: Colors.textMuted, marginLeft: Spacing.md,
  },
  centerBody: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  activationLine: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.6,
  },

  gateCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  gateHead: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 4,
  },
  gateDot: {
    width: 10, height: 10, borderRadius: 999, marginRight: Spacing.sm,
  },
  gateNum: {
    fontSize: Typography.size.lg, color: Colors.gold,
    fontFamily: Typography.font.serif, fontWeight: Typography.weight.bold,
    width: 32,
  },
  gateName: {
    flex: 1, fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  gateCenter: { fontSize: 16 },
  gateTheme: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginVertical: 4, lineHeight: Typography.size.sm * 1.5,
  },
  gateRow: {
    flexDirection: 'row', gap: Spacing.md,
    marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  miniLabel: { fontSize: 9, letterSpacing: 1, color: Colors.textMuted },
  miniValue: { fontSize: Typography.size.xs, color: Colors.text, marginTop: 2 },
  gateTag: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted,
    marginTop: Spacing.sm,
  },

  planetTable: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  planetHead: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: Spacing.sm,
  },
  planetHeadText: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  planetRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  planetCell: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.size.sm,
    color: Colors.text,
  },
  planetGateName: {
    fontSize: 10, color: Colors.textMuted,
  },
});
