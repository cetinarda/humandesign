# Sakin Tasarım

Sakin.life ekosisteminin Human Design üyesi. Doğum gün, saat ve şehrini girerek
kendine özel bir tasarım haritası (bodygraph) oluşturur; tip, içsel yetki, profil,
tanımlı/tanımsız merkezler, kanallar ve 64 kapı üzerinden detaylı bir rapor sunar.

## Çalıştırma

```sh
npm install
npm run web        # tarayıcıda
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## Yapı

- **Expo + React Native + Web** (TypeScript)
- **AsyncStorage** ile lokal saklama; doğum bilgileri sunucuya gönderilmez
- **Lokal efemerit** (Meeus tabanlı): tüm gezegen pozisyonları cihazda hesaplanır
- **react-native-svg** ile bodygraph çizimi
- Netlify üzerinden statik web build

## Özellikler

- 5 tip · 7 içsel yetki · 12 profil · 9 merkez · 36 kanal · 64 kapı detayı
- Bilinçli (Personality) ve bilinçsiz (Design) gezegen aktivasyonları
- Tanımlı / tanımsız merkez ayrımı, yanlış benlik soruları ve kazanılan bilgelik
- Inkarnasyon Haçı, Tanım türü (Single/Split/Triple/Quadruple)
- Çoklu profil desteği — sevdiklerini de ekleyebilirsin
- Günlük transit: bugünün Güneş ve Ay kapısı

## Veri & Hesaplama

- Gezegen ekliptik boylamları için düşük-orta hassasiyetli VSOP/Meeus formülleri
- Design zamanı: Personality Sun pozisyonundan 88° geride iteratif çözüm
- Gate çark sırası ekliptik 302° (Aquarius 2°) noktasından başlar

## Lisans

Özel/araştırma kullanımı.
