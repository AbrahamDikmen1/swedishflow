import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../src/components/Icon';
import Button from '../../src/components/Button';
import { AudioPlayer } from '../../src/components/AudioPlayer';
import { theme } from '../../src/theme/theme';
import { useProgress } from '../../src/context/ProgressContext';

interface VocabularyItem {
  id: string;
  swedish: string;
  category: string;
  explanation: string;
  translation: string;
  example: string;
  missionId: string;
  missionOrder: number;
  type: 'phrase' | 'grammar' | 'word';
  audioUrl?: string;
}

const VOCABULARY_DATA: VocabularyItem[] = [
  // Uppdrag 1: Hälsa och säga hej
  {
    id: 'v1',
    swedish: 'Hej!',
    category: 'Hälsningar',
    explanation: 'Den vanligaste hälsningsfrasen i Sverige. Används i alla situationer.',
    translation: 'Hello! / Hi!',
    example: 'Hej! Hur mår du?',
    missionId: '1',
    missionOrder: 1,
    type: 'phrase',
  },
  {
    id: 'v2',
    swedish: 'God morgon!',
    category: 'Hälsningar',
    explanation: 'Används på morgonen fram till lunch.',
    translation: 'Good morning!',
    example: 'God morgon! Sov du gott?',
    missionId: '1',
    missionOrder: 1,
    type: 'phrase',
  },
  {
    id: 'v3',
    swedish: 'Hur mår du?',
    category: 'Hälsningar',
    explanation: 'Fråga om någons mående och allmänna tillstånd.',
    translation: 'How are you?',
    example: 'Hej Sara! Hur mår du idag?',
    missionId: '1',
    missionOrder: 1,
    type: 'phrase',
  },
  {
    id: 'v4',
    swedish: 'Bra, tack!',
    category: 'Hälsningar',
    explanation: 'Positivt standardsvar på "Hur mår du?".',
    translation: 'Good, thank you!',
    example: 'Jag mår bara bra, tack!',
    missionId: '1',
    missionOrder: 1,
    type: 'phrase',
  },
  {
    id: 'v5',
    swedish: 'Hej då!',
    category: 'Hälsningar',
    explanation: 'Standardfras när du tar avsked från någon.',
    translation: 'Goodbye! / Bye!',
    example: 'Tack för idag! Hej då!',
    missionId: '1',
    missionOrder: 1,
    type: 'phrase',
  },

  // Uppdrag 2: Berätta vad du heter
  {
    id: 'v6',
    swedish: 'Jag heter...',
    category: 'Presentation',
    explanation: 'Används när du presenterar dig och anger ditt namn.',
    translation: 'My name is...',
    example: 'Jag heter Anna.',
    missionId: '2',
    missionOrder: 2,
    type: 'phrase',
  },
  {
    id: 'v7',
    swedish: 'Vad heter du?',
    category: 'Presentation',
    explanation: 'Fråga för att ta reda på vad en annan person heter.',
    translation: 'What is your name?',
    example: 'Hej! Vad heter du?',
    missionId: '2',
    missionOrder: 2,
    type: 'phrase',
  },
  {
    id: 'v8',
    swedish: 'Trevligt att träffas!',
    category: 'Presentation',
    explanation: 'Artig fras som sägs när du hälsar på någon för första gången.',
    translation: 'Nice to meet you!',
    example: 'Jag heter Erik. Trevligt att träffas!',
    missionId: '2',
    missionOrder: 2,
    type: 'phrase',
  },

  // Uppdrag 3: Berätta var du kommer ifrån
  {
    id: 'v9',
    swedish: 'Var kommer du ifrån?',
    category: 'Ursprung',
    explanation: 'Fråga för att ta reda på en persons hemland eller ursprung.',
    translation: 'Where are you from?',
    example: 'Var kommer du ifrån, Ali?',
    missionId: '3',
    missionOrder: 3,
    type: 'phrase',
  },
  {
    id: 'v10',
    swedish: 'Jag kommer från...',
    category: 'Ursprung',
    explanation: 'Används för att berätta vilket land du härstammar ifrån.',
    translation: 'I come from... / I am from...',
    example: 'Jag kommer från Syrien.',
    missionId: '3',
    missionOrder: 3,
    type: 'phrase',
  },

  // Uppdrag 4: Berätta var du bor
  {
    id: 'v11',
    swedish: 'Var bor du?',
    category: 'Bostad',
    explanation: 'Fråga om var någon har sin bostad eller ort.',
    translation: 'Where do you live?',
    example: 'Var bor du någonstans?',
    missionId: '4',
    missionOrder: 4,
    type: 'phrase',
  },
  {
    id: 'v12',
    swedish: 'en lägenhet',
    category: 'Bostad',
    explanation: 'Bostad i ett flervåningshus (en-ord).',
    translation: 'an apartment / flat',
    example: 'Jag bor i en lägenhet i centrum.',
    missionId: '4',
    missionOrder: 4,
    type: 'word',
  },
  {
    id: 'v13',
    swedish: 'ett hus',
    category: 'Bostad',
    explanation: 'Fristående bostadsbyggnad (ett-ord).',
    translation: 'a house',
    example: 'De bor i ett rött hus.',
    missionId: '4',
    missionOrder: 4,
    type: 'word',
  },

  // Uppdrag 5: Ålder och siffror
  {
    id: 'v14',
    swedish: 'Hur gammal är du?',
    category: 'Ålder & Siffror',
    explanation: 'Fråga om en persons ålder.',
    translation: 'How old are you?',
    example: 'Hur gammal är du? – Jag är 28 år.',
    missionId: '5',
    missionOrder: 5,
    type: 'phrase',
  },
  {
    id: 'v15',
    swedish: 'Jag är ... år gammal.',
    category: 'Ålder & Siffror',
    explanation: 'Uttrycker ålder (med verbet är).',
    translation: 'I am ... years old.',
    example: 'Jag är 32 år gammal.',
    missionId: '5',
    missionOrder: 5,
    type: 'phrase',
  },

  // Uppdrag 6: Yrken och arbete
  {
    id: 'v16',
    swedish: 'Vad jobbar du med?',
    category: 'Yrken & Arbete',
    explanation: 'Fråga om sysselsättning eller yrke.',
    translation: 'What do you work with?',
    example: 'Vad jobbar du med i Sverige?',
    missionId: '6',
    missionOrder: 6,
    type: 'phrase',
  },
  {
    id: 'v17',
    swedish: 'Jag jobbar som...',
    category: 'Yrken & Arbete',
    explanation: 'Anger yrkesroll utan artikel.',
    translation: 'I work as a...',
    example: 'Jag jobbar som sjuksköterska.',
    missionId: '6',
    missionOrder: 6,
    type: 'phrase',
  },

  // Uppdrag 7: Språk
  {
    id: 'v18',
    swedish: 'Jag pratar lite svenska.',
    category: 'Språk',
    explanation: 'Beskriver grundläggande kunskaper i svenska.',
    translation: 'I speak a little Swedish.',
    example: 'Jag pratar lite svenska och bra engelska.',
    missionId: '7',
    missionOrder: 7,
    type: 'phrase',
  },

  // Uppdrag 8: Familj
  {
    id: 'v19',
    swedish: 'min man / min fru',
    category: 'Familj',
    explanation: 'Make eller maka.',
    translation: 'my husband / my wife',
    example: 'Det här är min fru.',
    missionId: '8',
    missionOrder: 8,
    type: 'word',
  },
  {
    id: 'v20',
    swedish: 'mina barn',
    category: 'Familj',
    explanation: 'Pluralform för söner och döttrar.',
    translation: 'my children',
    example: 'Jag har två barn som går i skolan.',
    missionId: '8',
    missionOrder: 8,
    type: 'word',
  },

  // Uppdrag 9: Tid & Klockan
  {
    id: 'v21',
    swedish: 'Vad är klockan?',
    category: 'Tid & Klockan',
    explanation: 'Fråga om aktuell tidpunkt.',
    translation: 'What time is it?',
    example: 'Ursäkta, vad är klockan? – Den är två.',
    missionId: '9',
    missionOrder: 9,
    type: 'phrase',
  },
  {
    id: 'v22',
    swedish: 'halv åtta (07:30)',
    category: 'Tid & Klockan',
    explanation: 'Betyder en halvtimme FÖRE åtta på svenska.',
    translation: 'half past seven (07:30)',
    example: 'Tåget går klockan halv åtta.',
    missionId: '9',
    missionOrder: 9,
    type: 'word',
  },

  // Uppdrag 10: Handla mat
  {
    id: 'v23',
    swedish: 'Vad kostar det?',
    category: 'Handla',
    explanation: 'Fråga om pris på en vara.',
    translation: 'How much does it cost?',
    example: 'Vad kostar äpplena per kilo?',
    missionId: '10',
    missionOrder: 10,
    type: 'phrase',
  },
  {
    id: 'v24',
    swedish: 'Vill du ha kvittot?',
    category: 'Handla',
    explanation: 'Standardfras i butikskassan.',
    translation: 'Do you want the receipt?',
    example: 'Vill du ha kvittot? – Nej tack, det är bra.',
    missionId: '10',
    missionOrder: 10,
    type: 'phrase',
  },

  // Uppdrag 11: Café & Fika
  {
    id: 'v25',
    swedish: 'Kan jag få en kopp kaffe, tack?',
    category: 'Café & Mat',
    explanation: 'Artig beställningsfras på café.',
    translation: 'Can I have a cup of coffee, please?',
    example: 'Kan jag få en kaffe och en kanelbulle, tack?',
    missionId: '11',
    missionOrder: 11,
    type: 'phrase',
  },
  {
    id: 'v26',
    swedish: 'Kan vi få notan, tack?',
    category: 'Café & Mat',
    explanation: 'Be om räkningen på restaurang.',
    translation: 'Can we have the bill, please?',
    example: 'Ursäkta, kan vi få notan?',
    missionId: '11',
    missionOrder: 11,
    type: 'phrase',
  },
];

const CATEGORIES = [
  'Alla',
  'Hälsningar',
  'Presentation',
  'Ursprung',
  'Bostad',
  'Ålder & Siffror',
  'Yrken & Arbete',
  'Språk',
  'Familj',
  'Tid & Klockan',
  'Handla',
  'Café & Mat',
];

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width > 600;

  const { completedMissionIds } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alla');

  const filteredVocabulary = useMemo(() => {
    return VOCABULARY_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Alla' || item.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.swedish.toLowerCase().includes(query) ||
        item.translation.toLowerCase().includes(query) ||
        item.explanation.toLowerCase().includes(query) ||
        item.example.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const bottomPadding = 60 + Math.max(insets.bottom, 10) + 24;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
          isTabletOrWeb && styles.tabletScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isTabletOrWeb && styles.tabletContainer]}>
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Språkboken</Text>
            <Text style={styles.subtitle}>
              Ditt kompletta bibliotek med alla ord, fraser och grammatikregler från A1-kursen.
            </Text>
          </View>

          {/* INFO & SOURCE BANNER */}
          <View style={styles.infoBanner}>
            <Icon name="book-outline" size={20} color="#1E4E8C" />
            <Text style={styles.infoBannerText}>
              Innehåller ord och uttryck från samtliga 12 A1-uppdrag. Ord från genomförda uppdrag markeras som inlärda.
            </Text>
          </View>

          {/* SEARCH INPUT */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Sök ord, fras eller översättning..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Sök i Språkboken"
            />
            {searchQuery.length > 0 && (
              <Pressable
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                accessibilityLabel="Rensa sökning"
              >
                <Text style={styles.clearSearchText}>×</Text>
              </Pressable>
            )}
          </View>

          {/* CATEGORY FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrera efter ${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* RESULT COUNT */}
          <View style={styles.resultHeaderRow}>
            <Text style={styles.resultCountText}>
              Visar {filteredVocabulary.length} av {VOCABULARY_DATA.length} ord & fraser
            </Text>
          </View>

          {/* VOCABULARY LIST */}
          {filteredVocabulary.length > 0 ? (
            <View style={styles.vocabList}>
              {filteredVocabulary.map((item) => {
                const isFromCompletedMission = completedMissionIds.includes(
                  item.missionId
                );

                return (
                  <View key={item.id} style={styles.vocabCard}>
                    <View style={styles.vocabCardHeader}>
                      <View style={styles.vocabMainTitleRow}>
                        <Text style={styles.vocabSwedish}>{item.swedish}</Text>
                        <AudioPlayer
                          text={item.swedish}
                          audioUrl={item.audioUrl}
                          compact={true}
                        />
                      </View>

                      <Text style={styles.vocabTranslation}>{item.translation}</Text>
                    </View>

                    <Text style={styles.vocabExplanation}>{item.explanation}</Text>

                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleLabel}>Exempel:</Text>
                      <Text style={styles.exampleText}>"{item.example}"</Text>
                    </View>

                    <View style={styles.vocabCardFooter}>
                      <View style={styles.badgeCategory}>
                        <Text style={styles.badgeCategoryText}>{item.category}</Text>
                      </View>

                      {isFromCompletedMission ? (
                        <View style={styles.badgeLearned}>
                          <Icon name="checkmark-circle-outline" size={14} color="#059669" />
                          <Text style={styles.badgeLearnedText}>Inlärt (Uppdrag {item.missionOrder})</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeMission}>
                          <Text style={styles.badgeMissionText}>Uppdrag {item.missionOrder}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="book-outline" size={32} color="#64748B" />
              <Text style={styles.emptyTitle}>Inga träffar hittades</Text>
              <Text style={styles.emptyBody}>
                Inga ord eller fraser matchade din sökning "{searchQuery}". Prova att söka efter något annat eller välj en annan kategori.
              </Text>
              <Button
                title="Återställ sökning"
                variant="secondary"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('Alla');
                }}
              />
            </View>
          )}

          {/* CALL TO ACTION */}
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Vill du träna vidare på uppdragen?</Text>
            <Text style={styles.actionBody}>
              Gå till kursöversikten för att fortsätta med dina A1-uppdrag i kronologisk ordning.
            </Text>
            <View style={styles.actionButtonWrapper}>
              <Button
                title="Gå till kursen"
                variant="primary"
                onPress={() => router.push('/(tabs)/learn')}
                accessibilityLabel="Gå till kursen"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  tabletScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  mainContainer: {
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 640,
    alignSelf: 'center',
  },
  headerContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.xs,
    color: '#1E40AF',
    lineHeight: 18,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: -2,
  },
  categoriesContainer: {
    gap: 8,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#1E4E8C',
    borderColor: '#1E4E8C',
  },
  categoryChipText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  resultHeaderRow: {
    marginBottom: theme.spacing.md,
  },
  resultCountText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  vocabList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  vocabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  vocabCardHeader: {
    marginBottom: 6,
  },
  vocabMainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vocabSwedish: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  vocabTranslation: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: '#1E4E8C',
    marginTop: 2,
  },
  vocabExplanation: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  exampleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#1E4E8C',
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  exampleText: {
    fontSize: theme.typography.sizes.xs,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
  },
  vocabCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badgeCategory: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  badgeLearned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeLearnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  badgeMission: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeMissionText: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  actionBody: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  actionButtonWrapper: {
    maxWidth: 200,
  },
});
