import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { CITIES, City, searchCities } from '../data/cities';
import { TYPES } from '../data/types';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    profiles, activeProfile, stats, getLevelTitle,
    addProfile, selectProfile, deleteProfile, chart,
  } = useTasarimStore();

  const [showForm, setShowForm] = useState(false);

  if (!activeProfile && !showForm) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.medallion}>✦</Text>
        <Text style={styles.emptyTitle}>Profilini oluştur</Text>
        <Text style={styles.emptyDesc}>
          Adın, doğum günün, doğum saatin ve doğum şehrin Human Design haritan için
          gereklidir. Bilgiler cihazında tutulur, dışarı gönderilmez.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Başla →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showForm) {
    return (
      <NewProfileForm
        onCancel={() => setShowForm(false)}
        onSave={async (name, date, time, city) => {
          await addProfile(name, date, time, city, true);
          setShowForm(false);
        }}
      />
    );
  }

  const t = chart ? TYPES[chart.type] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{t?.emoji || '✦'}</Text>
        </View>
        <Text style={styles.name}>{activeProfile!.name}</Text>
        {chart && (
          <Text style={styles.subtitle}>
            {chart.type} · {chart.profile} · {chart.authority === 'lunar' ? 'Lunar' :
              chart.authority === 'emotional' ? 'Duygusal' :
              chart.authority === 'sacral' ? 'Sakral' :
              chart.authority === 'splenic' ? 'Splenik' :
              chart.authority === 'ego' ? 'Kalp/Ego' :
              chart.authority === 'self-projected' ? 'Self' : 'Mental'}
          </Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalOpens}</Text>
          <Text style={styles.statLabel}>Toplam Açılış</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.streak}🔥</Text>
          <Text style={styles.statLabel}>Süreklilik</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{getLevelTitle(stats.level)}</Text>
          <Text style={styles.statLabel}>Sv. {stats.level}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardKicker}>DOĞUM BİLGİLERİ</Text>
        <InfoRow k="Tarih" v={activeProfile!.birthDate} />
        <InfoRow k="Saat" v={activeProfile!.birthTime} />
        <InfoRow k="Şehir" v={activeProfile!.city.name} />
        <InfoRow k="Enlem / Boylam"
          v={`${activeProfile!.city.lat.toFixed(2)}° / ${activeProfile!.city.lng.toFixed(2)}°`} />
        <InfoRow k="UTC Ofset" v={`UTC${activeProfile!.city.tz >= 0 ? '+' : ''}${activeProfile!.city.tz}`} />
      </View>

      {chart && (
        <View style={styles.infoCard}>
          <Text style={styles.cardKicker}>HARİTA ÖZETİ</Text>
          <InfoRow k="Tip" v={chart.type} />
          <InfoRow k="Strateji" v={chart.strategy} />
          <InfoRow k="Doğru Frekans" v={chart.signature} />
          <InfoRow k="Yanlış Frekans" v={chart.notSelf} />
          <InfoRow k="Profil" v={chart.profile} />
          <InfoRow k="Tanım" v={chart.definition} />
          <InfoRow k="Aktif Kapı" v={`${chart.activeGates.size} / 64`} />
          <InfoRow k="Aktif Kanal" v={`${chart.activeChannels.length}`} />
          <InfoRow k="Tanımlı Merkez" v={`${chart.definedCenters.size} / 9`} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Kayıtlı Profiller ({profiles.length})</Text>
      {profiles.map(p => {
        const isActive = p.id === activeProfile!.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.profileRow, isActive && { borderColor: Colors.gold }]}
            activeOpacity={0.85}
            onPress={() => selectProfile(p.id)}
            onLongPress={() => {
              Alert.alert('Profili sil', `${p.name} silinsin mi?`, [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteProfile(p.id) },
              ]);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{p.name}</Text>
              <Text style={styles.profileMeta}>
                {p.birthDate} · {p.birthTime} · {p.city.name}
              </Text>
            </View>
            {isActive && <Text style={styles.activeChip}>AKTİF</Text>}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addBtnText}>+ Yeni Profil Ekle</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Bilgilerin yalnızca cihazında saklanır. Hesaplamalar lokal olarak yapılır;
        doğum verin sunucuya gönderilmez.
      </Text>
    </ScrollView>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.k}>{k}</Text>
      <Text style={infoStyles.v} numberOfLines={2}>{v}</Text>
    </View>
  );
}

function NewProfileForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (name: string, date: string, time: string, city: City) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const suggestions = useMemo(
    () => (city ? [] : searchCities(cityQuery, 6)),
    [cityQuery, city]
  );

  function validate(): string | null {
    if (!name.trim()) return 'Lütfen adını gir.';
    const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
    if (isNaN(d) || d < 1 || d > 31) return 'Gün 1-31 arasında olmalı.';
    if (isNaN(m) || m < 1 || m > 12) return 'Ay 1-12 arasında olmalı.';
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) return 'Geçerli bir yıl gir.';
    const h = parseInt(hour, 10), mi = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23) return 'Saat 0-23 arasında olmalı.';
    if (isNaN(mi) || mi < 0 || mi > 59) return 'Dakika 0-59 arasında olmalı.';
    if (!city) return 'Lütfen bir doğum şehri seç.';
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    const dStr = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const tStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    try {
      await onSave(name.trim(), dStr, tStr, city!);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.formTitle}>Yeni Profil</Text>
      <Text style={styles.formSub}>
        Doğum saatin ne kadar net olursa profil ve içsel yetkin o kadar doğru hesaplanır.
        Saatten emin değilsen yaklaşık bir tahmin yine de değerlidir.
      </Text>

      <Text style={styles.label}>İsim</Text>
      <TextInput
        style={styles.input}
        placeholder="Adın"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Doğum Tarihi</Text>
      <View style={styles.row3}>
        <TextInput
          style={[styles.input, styles.row3Item]}
          placeholder="GG"
          placeholderTextColor={Colors.textMuted}
          value={day}
          onChangeText={t => setDay(t.replace(/\D/g, '').slice(0, 2))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.row3Item]}
          placeholder="AA"
          placeholderTextColor={Colors.textMuted}
          value={month}
          onChangeText={t => setMonth(t.replace(/\D/g, '').slice(0, 2))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.row3Item, { flex: 1.5 }]}
          placeholder="YYYY"
          placeholderTextColor={Colors.textMuted}
          value={year}
          onChangeText={t => setYear(t.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      <Text style={styles.label}>Doğum Saati (24 saat)</Text>
      <View style={styles.row3}>
        <TextInput
          style={[styles.input, styles.row3Item]}
          placeholder="SS"
          placeholderTextColor={Colors.textMuted}
          value={hour}
          onChangeText={t => setHour(t.replace(/\D/g, '').slice(0, 2))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.row3Item]}
          placeholder="DD"
          placeholderTextColor={Colors.textMuted}
          value={minute}
          onChangeText={t => setMinute(t.replace(/\D/g, '').slice(0, 2))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <View style={[styles.row3Item, { flex: 1.5 }]} />
      </View>

      <Text style={styles.label}>Doğum Şehri</Text>
      <TextInput
        style={styles.input}
        placeholder="Şehir ara: ör. İstanbul"
        placeholderTextColor={Colors.textMuted}
        value={city ? city.name : cityQuery}
        onChangeText={t => { setCity(null); setCityQuery(t); }}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestBox}>
          {suggestions.map(c => (
            <TouchableOpacity
              key={c.name}
              style={styles.suggestRow}
              onPress={() => { setCity(c); setCityQuery(c.name); }}
            >
              <Text style={styles.suggestText}>{c.name}</Text>
              <Text style={styles.suggestMeta}>UTC{c.tz >= 0 ? '+' : ''}{c.tz}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {city && (
        <Text style={styles.hint}>
          ✓ {city.name} · UTC{city.tz >= 0 ? '+' : ''}{city.tz}
          {city.dst === 'eu' ? ' (AB yaz saati uygulanır)' :
           city.dst === 'us' ? ' (ABD yaz saati uygulanır)' : ''}
        </Text>
      )}

      {error && <Text style={styles.error}>! {error}</Text>}

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
          <Text style={styles.secondaryBtnText}>Vazgeç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { flex: 1 }]}
          onPress={handleSave}
          disabled={submitting}
        >
          <Text style={styles.primaryBtnText}>
            {submitting ? 'Hesaplanıyor…' : 'Haritamı Çıkar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  k: { fontSize: Typography.size.sm, color: Colors.textMuted },
  v: {
    fontSize: Typography.size.sm, color: Colors.text,
    fontWeight: Typography.weight.medium, maxWidth: '60%', textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },

  empty: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  medallion: {
    fontSize: 64, color: Colors.gold, marginBottom: Spacing.lg, opacity: 0.85,
  },
  emptyTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: Spacing.md,
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.xl,
  },

  header: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 84, height: 84, borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.gold + '40',
    marginBottom: Spacing.md,
    ...Shadows.gold,
  },
  avatarEmoji: { fontSize: 36 },
  name: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  subtitle: {
    fontSize: Typography.size.sm, color: Colors.gold, marginTop: 4, letterSpacing: 0.6,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif, fontWeight: Typography.weight.bold,
  },
  statLabel: {
    fontSize: 10, letterSpacing: 1, color: Colors.textMuted, marginTop: 2,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardKicker: {
    fontSize: 10, letterSpacing: 1.5, color: Colors.gold, marginBottom: Spacing.sm,
  },

  sectionTitle: {
    fontSize: Typography.size.lg, color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  profileName: {
    fontSize: Typography.size.md, color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  profileMeta: {
    fontSize: Typography.size.xs, color: Colors.textMuted, marginTop: 2,
  },
  activeChip: {
    fontSize: 10, letterSpacing: 1, color: Colors.gold,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.gold + '15',
  },
  addBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.round,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.gold + '40',
    borderStyle: 'dashed',
  },
  addBtnText: {
    color: Colors.gold, fontWeight: Typography.weight.semibold,
  },
  footerNote: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.lg, lineHeight: Typography.size.xs * 1.6,
    fontStyle: 'italic',
  },

  // Form
  formTitle: {
    fontSize: Typography.size.xxl, color: Colors.text,
    fontFamily: Typography.font.serif, marginBottom: 4,
  },
  formSub: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    lineHeight: Typography.size.sm * 1.6,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 11, letterSpacing: 1.2, color: Colors.gold,
    marginTop: Spacing.md, marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: Typography.size.md,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  row3: { flexDirection: 'row', gap: Spacing.sm },
  row3Item: { flex: 1 },
  suggestBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginTop: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  suggestRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  suggestText: { color: Colors.text, fontSize: Typography.size.sm },
  suggestMeta: { color: Colors.textMuted, fontSize: Typography.size.xs },
  hint: {
    fontSize: Typography.size.xs, color: Colors.success,
    marginTop: 4, marginLeft: 4,
  },
  error: {
    color: Colors.emberSoft, fontSize: Typography.size.sm,
    marginTop: Spacing.md, fontStyle: 'italic',
  },
  btnRow: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadows.gold,
  },
  primaryBtnText: {
    color: Colors.background, fontWeight: Typography.weight.bold,
    fontSize: Typography.size.md,
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  secondaryBtnText: { color: Colors.text },
});
