import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../src/theme/theme';
import { useCourse } from '../../../src/context/CourseContext';
import { useAuth } from '../../../src/context/AuthContext';
import { LessonBlock, LessonData } from '../../../src/types/lesson';
import { Mission } from '../../../src/types/mission';
import Icon, { IconName } from '../../../src/components/Icon';
import BackButton from '../../../src/components/BackButton';
import Button from '../../../src/components/Button';

export interface BlockTypeMeta {
  category: 'Innehåll' | 'Övning' | 'Uttalsövning' | 'AI-övning' | 'Avslutning';
  label: string;
  displayCategory: string;
  icon: IconName;
  color: string;
  desc: string;
}

export function getBlockTypeInfo(type: LessonBlock['type']): BlockTypeMeta {
  switch (type) {
    case 'introduction':
      return {
        category: 'Innehåll',
        label: 'Introduktion',
        displayCategory: 'Innehåll – Introduktion',
        icon: 'book-outline',
        color: '#1E4E8C',
        desc: 'Introducerar sammanhang och vardagssituation',
      };
    case 'dialogue':
      return {
        category: 'Innehåll',
        label: 'Dialog',
        displayCategory: 'Innehåll – Dialog',
        icon: 'chatbubbles-outline',
        color: '#0369A1',
        desc: 'Samtal mellan två eller flera talare',
      };
    case 'explanation':
      return {
        category: 'Innehåll',
        label: 'Språkförklaring',
        displayCategory: 'Innehåll – Språkförklaring',
        icon: 'information-circle-outline',
        color: '#4338CA',
        desc: 'Grammatik och språkmönster',
      };
    case 'vocabulary':
      return {
        category: 'Innehåll',
        label: 'Vokabulär & Fraser',
        displayCategory: 'Innehåll – Vokabulär',
        icon: 'list-outline',
        color: '#0D9488',
        desc: 'Viktiga ord, uttal och förklaringar',
      };
    case 'multiple_choice':
      return {
        category: 'Övning',
        label: 'Frågor och svar',
        displayCategory: 'Övning – Frågor och svar',
        icon: 'checkmark-circle-outline',
        color: '#D97706',
        desc: 'Välj rätt alternativ bland flervalsalternativ',
      };
    case 'listen_choice':
      return {
        category: 'Övning',
        label: 'Lyssna & välj',
        displayCategory: 'Övning – Lyssna',
        icon: 'volume-high-outline',
        color: '#2563EB',
        desc: 'Lyssna på ljud/fras och välj rätt svar',
      };
    case 'sentence_builder':
      return {
        category: 'Övning',
        label: 'Bygg mening',
        displayCategory: 'Övning – Bygg mening',
        icon: 'create-outline',
        color: '#7C3AED',
        desc: 'Pussla ihop ord till en korrekt mening',
      };
    case 'fill_blank':
      return {
        category: 'Övning',
        label: 'Fyll i luckan',
        displayCategory: 'Övning – Lucktext',
        icon: 'create',
        color: '#0284C7',
        desc: 'Välj rätt ord som saknas i meningen',
      };
    case 'matching':
      return {
        category: 'Övning',
        label: 'Matcha par',
        displayCategory: 'Övning – Matchning',
        icon: 'sync-outline',
        color: '#059669',
        desc: 'Para ihop frågor och svar eller ord',
      };
    case 'free_text':
      return {
        category: 'Övning',
        label: 'Fri text',
        displayCategory: 'Övning – Fri text',
        icon: 'create-outline',
        color: '#DC2626',
        desc: 'Skriv eget svar med pedagogisk respons',
      };
    case 'speak':
      return {
        category: 'Uttalsövning',
        label: 'Tala',
        displayCategory: 'Uttalsövning – Tala',
        icon: 'mic-outline',
        color: '#E11D48',
        desc: 'Träna på uttal och muntlig fras',
      };
    case 'ai_roleplay':
      return {
        category: 'AI-övning',
        label: 'Rollspel',
        displayCategory: 'AI-övning – Rollspel',
        icon: 'star',
        color: '#8B5CF6',
        desc: 'Interaktiv konversation i verklig situation',
      };
    case 'summary':
      return {
        category: 'Avslutning',
        label: 'Sammanfattning',
        displayCategory: 'Avslutning – Sammanfattning',
        icon: 'star',
        color: '#15803D',
        desc: 'Uppdragsavslutning och sammanfattning',
      };
    default:
      return {
        category: 'Övning',
        label: 'Övningssteg',
        displayCategory: 'Övning – Steg',
        icon: 'book-outline',
        color: '#64748B',
        desc: 'Allmänt övningssteg',
      };
  }
}

function getBlockSummaryText(block: any): string {
  if (block.introduction) return block.introduction;
  if (block.lines && Array.isArray(block.lines)) {
    return block.lines.map((l: any) => `${l.speaker || 'Talare'}: "${l.text || ''}"`).join('  •  ');
  }
  if (block.phrases && Array.isArray(block.phrases)) {
    return block.phrases.map((p: any) => `${p.phrase || ''} (${p.translation || ''})`).join(', ');
  }
  if (block.exercise?.question) return block.exercise.question;
  if (block.exercise?.prompt) return block.exercise.prompt;
  if (block.exercise?.instruction) return block.exercise.instruction;
  if (block.exercise?.targetPhrase) return `Öva fras: "${block.exercise.targetPhrase}"`;
  if (block.exercise?.sentence) return `Mening: ${block.exercise.sentence}`;
  if (block.exercise?.initialWords) return `Byggstenar: ${block.exercise.initialWords.join(', ')}`;
  if (block.explanation) return block.explanation;
  if (block.subtitle) return block.subtitle;
  return 'Pedagogiskt övningsmoment konfigurerat.';
}

export default function AdminMissionEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isSmallMobile = width < 380;
  const isTabletOrWeb = width >= 768;
  const { id } = useLocalSearchParams<{ id: string }>();

  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const {
    missions,
    isLoading: isCourseLoading,
    updateMission,
    togglePublishMission,
    getLesson,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
  } = useCourse();

  const mission = missions.find((m: Mission) => m.id === id);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  // Mission Metadata Edit State
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaMinutes, setMetaMinutes] = useState('7');
  const [metaPoints, setMetaPoints] = useState('50');

  // Block creation modal: 'content' | 'exercise' | null
  const [addModalCategory, setAddModalCategory] = useState<'content' | 'exercise' | null>(null);
  const [selectedNewType, setSelectedNewType] = useState<LessonBlock['type']>('multiple_choice');

  // Block editing modal
  const [editingBlock, setEditingBlock] = useState<LessonBlock | null>(null);
  const [blockForm, setBlockForm] = useState<any>({});

  useEffect(() => {
    if (id) {
      setIsLoadingLesson(true);
      getLesson(id)
        .then((data) => {
          setLesson(data);
          if (mission) {
            setMetaTitle(mission.title);
            setMetaDesc(mission.description);
            setMetaMinutes(String(mission.estimatedMinutes || 7));
            setMetaPoints(String(mission.totalPoints || 50));
          }
        })
        .finally(() => setIsLoadingLesson(false));
    }
  }, [id, mission]);

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Kontrollerar behörighet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <BackButton onPress={() => router.push('/admin/login')} />
          <Text style={styles.notFoundText}>Endast behöriga administratörer kan redigera uppdrag.</Text>
          <Button title="Logga in som admin" onPress={() => router.push('/admin/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (isCourseLoading || isLoadingLesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Icon name="refresh-outline" size={32} color="#1E4E8C" />
          <Text style={[styles.notFoundText, { marginTop: 12 }]}>Läser in uppdrag och lektionsblock...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <BackButton onPress={() => router.push('/admin')} />
          <Text style={styles.notFoundText}>Uppdraget kunde inte hittas.</Text>
          <Button title="Tillbaka till admin" onPress={() => router.push('/admin')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveMeta = async () => {
    if (!id) return;
    await updateMission(id, {
      title: metaTitle,
      description: metaDesc,
      estimatedMinutes: parseInt(metaMinutes, 10) || 7,
      totalPoints: parseInt(metaPoints, 10) || 50,
    });
    setIsEditingMeta(false);
  };

  const handleMoveBlockUp = async (index: number) => {
    if (!lesson || index === 0) return;
    // Introduction cannot be moved
    if (lesson.blocks[index].type === 'summary') return;
    // Cannot move above introduction
    if (lesson.blocks[0].type === 'introduction' && index === 1) return;

    const ids = lesson.blocks.map((b) => b.id);
    const item = ids.splice(index, 1)[0];
    ids.splice(index - 1, 0, item);
    const updated = await reorderBlocks(mission.id, ids);
    setLesson(updated);
  };

  const handleMoveBlockDown = async (index: number) => {
    if (!lesson || index === lesson.blocks.length - 1) return;
    // Introduction cannot be moved down
    if (lesson.blocks[index].type === 'introduction') return;
    // Cannot move below summary
    if (
      lesson.blocks[lesson.blocks.length - 1].type === 'summary' &&
      index === lesson.blocks.length - 2
    ) {
      return;
    }

    const ids = lesson.blocks.map((b) => b.id);
    const item = ids.splice(index, 1)[0];
    ids.splice(index + 1, 0, item);
    const updated = await reorderBlocks(mission.id, ids);
    setLesson(updated);
  };

  const handleDuplicateBlock = async (blockId: string) => {
    const updated = await duplicateBlock(mission.id, blockId);
    setLesson(updated);
  };

  const handleDeleteBlock = async (blockId: string, label: string) => {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(`Radera lektionsblocket "${label}"?`)
        : true;
    if (confirmed) {
      const updated = await deleteBlock(mission.id, blockId);
      setLesson(updated);
    }
  };

  const handleOpenAddContent = () => {
    setSelectedNewType('dialogue');
    setAddModalCategory('content');
  };

  const handleOpenAddExercise = () => {
    setSelectedNewType('multiple_choice');
    setAddModalCategory('exercise');
  };

  const handleTogglePublishWithValidation = async () => {
    const introCount = lesson?.blocks.filter((b) => b.type === 'introduction').length || 0;
    const summaryCount = lesson?.blocks.filter((b) => b.type === 'summary').length || 0;

    if (introCount > 1 || summaryCount > 1) {
      const msg = 'Publicering blockerad: En lektion får endast ha maximalt en introduktion och en sammanfattning.';
      if (typeof window !== 'undefined') {
        window.alert(msg);
      } else {
        Alert.alert('Publicering blockerad', msg);
      }
      return;
    }

    await togglePublishMission(mission.id, !isPublished);
  };

  const handleConfirmAddBlock = async () => {
    const newBlockId = `${mission.id}_b${Date.now()}_${selectedNewType}`;
    let newBlock: LessonBlock;

    switch (selectedNewType) {
      case 'introduction':
        newBlock = {
          id: newBlockId,
          type: 'introduction',
          skills: ['vocabulary'],
          required: true,
          title: 'Vardagssituation',
          introduction: 'Här introduceras sammanhanget...',
          examples: [{ phrase: 'Hej!', translation: 'Hello!' }],
          grammaticalNote: 'Viktig regel att minnas.',
        };
        break;
      case 'dialogue':
        newBlock = {
          id: newBlockId,
          type: 'dialogue',
          skills: ['listening', 'reading'],
          required: true,
          title: 'Dialog i vardagen',
          scenario: 'Två personer samtalar...',
          lines: [
            { speaker: 'Person A', text: 'Hej! Hur mår du?' },
            { speaker: 'Person B', text: 'Bra, tack! Hur mår du?' },
          ],
        };
        break;
      case 'vocabulary':
        newBlock = {
          id: newBlockId,
          type: 'vocabulary',
          skills: ['vocabulary'],
          required: true,
          title: 'Nya ord och fraser',
          phrases: [
            { phrase: 'Ett ord', explanation: 'Förklaring av ordet' },
          ],
          infoBox: 'Tips för att minnas orden lättare.',
        };
        break;
      case 'multiple_choice':
        newBlock = {
          id: newBlockId,
          type: 'multiple_choice',
          skills: ['vocabulary'],
          required: true,
          exercise: {
            question: 'Vad betyder frasen?',
            options: ['Alternativ 1', 'Alternativ 2', 'Alternativ 3'],
            correctIndex: 0,
            explanationCorrect: 'Rätt svar!',
            explanationIncorrect: 'Försök igen.',
          },
        };
        break;
      case 'listen_choice':
        newBlock = {
          id: newBlockId,
          type: 'listen_choice',
          skills: ['listening'],
          required: true,
          exercise: {
            prompt: 'Lyssna och välj vad personen säger:',
            audioPlaceholderText: 'Hej och välkommen!',
            options: ['Hej och välkommen!', 'God natt!', 'Tack för idag!'],
            correctIndex: 0,
            explanationCorrect: 'Helt rätt hört!',
            explanationIncorrect: 'Lyssna noga en gång till.',
          },
        };
        break;
      case 'sentence_builder':
        newBlock = {
          id: newBlockId,
          type: 'sentence_builder',
          skills: ['grammar'],
          required: true,
          exercise: {
            instruction: 'Bygg en korrekt mening:',
            initialWords: ['Jag', 'heter', 'Anna.'],
            correctSentence: 'Jag heter Anna.',
            explanationCorrect: 'Snyggt byggt!',
            explanationIncorrect: 'Tänk på ordföljden.',
          },
        };
        break;
      case 'fill_blank':
        newBlock = {
          id: newBlockId,
          type: 'fill_blank',
          skills: ['grammar'],
          required: true,
          exercise: {
            sentence: 'Jag _____ i Sverige.',
            options: ['bor', 'heter', 'talar'],
            correctAnswer: 'bor',
            explanationCorrect: 'Helt rätt ord!',
            explanationIncorrect: 'Tänk på vilket verb som passar.',
          },
        };
        break;
      case 'matching':
        newBlock = {
          id: newBlockId,
          type: 'matching',
          skills: ['reading'],
          required: true,
          exercise: {
            instruction: 'Para ihop rätt fras med rätt svar:',
            pairs: [
              { id: 'p1', question: 'Hur mår du?', answer: 'Bra tack!' },
              { id: 'p2', question: 'Vad heter du?', answer: 'Jag heter Sara.' },
            ],
            explanationCorrect: 'Alla par matchade perfekt!',
          },
        };
        break;
      case 'free_text':
        newBlock = {
          id: newBlockId,
          type: 'free_text',
          skills: ['writing'],
          required: true,
          exercise: {
            instruction: 'Skriv ditt eget svar på svenska:',
            prompt: 'Berätta kort vad du heter och var du bor.',
            placeholder: 't.ex. Jag heter Sara och jag bor i Göteborg.',
            hintExample: 'Jag heter [namn] och jag bor i [stad].',
            regexPattern: '.*',
            explanationCorrect: 'Bra skrivet! Meningen är begriplig och grammatiskt godkänd.',
            explanationIncorrect: 'Kontrollera stavning och ordföljd.',
            explanationEmpty: 'Vänligen skriv ett svar innan du kontrollerar.',
            explanationIncomplete: 'Skriv en hel mening.',
          },
        };
        break;
      case 'speak':
        newBlock = {
          id: newBlockId,
          type: 'speak',
          skills: ['speaking'],
          required: true,
          exercise: {
            instruction: 'Träna på uttalet:',
            targetPhrase: 'Trevligt att träffas!',
            translation: 'Nice to meet you!',
            phoneticHint: 'Trehv-ligt att trehf-fas!',
            tips: 'Betona "träffas" mjukt.',
          },
        };
        break;
      case 'ai_roleplay':
        newBlock = {
          id: newBlockId,
          type: 'ai_roleplay',
          skills: ['speaking', 'writing'],
          required: true,
          exercise: {
            title: 'Fika på café',
            instruction: 'Öva på att beställa fika och fråga vad det kostar.',
            scenario: 'Du är på ett café i Sverige och vill beställa fika.',
            characterName: 'Emma',
            characterRole: 'Cafépersonal',
            userRole: 'Kund',
            languageLevel: 'A1',
            learningGoal: 'Träna på att hälsa, beställa fika, fråga om pris och betala på svenska.',
            initialMessage: 'Hej och välkommen till Caféet! Vad får det lov att vara?',
            goalDescription: 'Beställ kaffe och kanelbulle, fråga vad det kostar och tacka.',
            allowedTopics: ['fika', 'kaffe', 'bulle', 'pris', 'betalning', 'tack'],
            suggestedPhrases: ['En kaffe och en bulle, tack.', 'Vad kostar det?', 'Med kort, tack.', 'Tack så mycket!'],
            maxTurns: 8,
            exitRule: 'När beställningen är slutförd eller 8 turer har genomförts',
            showFeedback: true,
          },
        };
        break;
      case 'summary':
        newBlock = {
          id: newBlockId,
          type: 'summary',
          skills: ['reading'],
          required: true,
          title: 'Uppdrag slutfört!',
          subtitle: 'Grymt jobbat med övningarna!',
          summaryPhrases: ['Övat på viktiga fraser', 'Slutfört dialog och övningar'],
        };
        break;
      default:
        newBlock = {
          id: newBlockId,
          type: 'explanation',
          skills: ['grammar'],
          required: true,
          title: 'Språkförklaring',
          body: 'Förklarande text om språket...',
          examples: [{ phrase: 'Exempelmening' }],
        };
    }

    const updated = await addBlock(mission.id, newBlock);
    setLesson(updated);
    setAddModalCategory(null);

    // Open editor for the new block right away
    handleOpenEditBlock(newBlock);
  };

  const handleOpenEditBlock = (block: LessonBlock) => {
    setEditingBlock(block);
    setBlockForm(JSON.parse(JSON.stringify(block)));
  };

  const handleSaveBlockEdit = async () => {
    if (!editingBlock || !lesson) return;
    const updated = await updateBlock(mission.id, editingBlock.id, blockForm);
    setLesson(updated);
    setEditingBlock(null);
  };

  const isPublished = mission.isPublished !== false;

  const hasIntro = lesson?.blocks.some((b) => b.type === 'introduction');
  const hasSummary = lesson?.blocks.some((b) => b.type === 'summary');
  const introCount = lesson?.blocks.filter((b) => b.type === 'introduction').length || 0;
  const summaryCount = lesson?.blocks.filter((b) => b.type === 'summary').length || 0;
  const hasStructuralIssues = !hasIntro || !hasSummary || introCount > 1 || summaryCount > 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 20) + 60 },
        ]}
      >
        {/* WORKFLOW ORIENTATION BAR */}
        <View style={styles.workflowBar}>
          <View style={[styles.workflowStepItem, isEditingMeta && styles.workflowStepItemActive]}>
            <View style={[styles.workflowStepBadge, isEditingMeta && styles.workflowStepBadgeActive]}>
              <Text style={[styles.workflowStepNum, isEditingMeta && styles.workflowStepNumActive]}>1</Text>
            </View>
            <Text style={[styles.workflowStepTitle, isEditingMeta && styles.workflowStepTitleActive]}>
              1. Grunduppgifter
            </Text>
          </View>

          <View style={styles.workflowConnector} />

          <View style={[styles.workflowStepItem, !isEditingMeta && styles.workflowStepItemActive]}>
            <View style={[styles.workflowStepBadge, !isEditingMeta && styles.workflowStepBadgeActive]}>
              <Text style={[styles.workflowStepNum, !isEditingMeta && styles.workflowStepNumActive]}>2</Text>
            </View>
            <Text style={[styles.workflowStepTitle, !isEditingMeta && styles.workflowStepTitleActive]}>
              2. Bygg lektionen
            </Text>
          </View>

          <View style={styles.workflowConnector} />

          <Pressable
            style={styles.workflowStepItem}
            onPress={() => router.push(`/learn/a1/mission/${mission.id}`)}
          >
            <View style={styles.workflowStepBadge}>
              <Text style={styles.workflowStepNum}>3</Text>
            </View>
            <Text style={styles.workflowStepTitle}>3. Provkör</Text>
          </Pressable>

          <View style={styles.workflowConnector} />

          <View style={[styles.workflowStepItem, isPublished && styles.workflowStepItemActive]}>
            <View style={[styles.workflowStepBadge, isPublished && styles.workflowStepBadgeActive]}>
              <Text style={[styles.workflowStepNum, isPublished && styles.workflowStepNumActive]}>4</Text>
            </View>
            <Text style={[styles.workflowStepTitle, isPublished && styles.workflowStepTitleActive]}>
              4. Publicera
            </Text>
          </View>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <BackButton
            onPress={() => router.push('/admin')}
            accessibilityLabel="Gå tillbaka till adminöversikten"
          />
          <View style={styles.headerActionGroup}>
            <Pressable
              style={[
                styles.publishToggleBtn,
                isPublished ? styles.publishToggleBtnLive : styles.publishToggleBtnDraft,
              ]}
              onPress={handleTogglePublishWithValidation}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isPublished ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.publishToggleText,
                  { color: isPublished ? '#065F46' : '#92400E' },
                ]}
              >
                {isPublished ? 'Publicerad (Synlig)' : 'Utkast (Opublicerad)'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.previewBtn}
              onPress={() => router.push(`/learn/a1/mission/${mission.id}`)}
            >
              <Icon name="play" size={14} color="#FFFFFF" />
              <Text style={styles.previewBtnText}>Provkör lektion</Text>
            </Pressable>
          </View>
        </View>

        {/* VALIDATION WARNING BANNER */}
        {hasStructuralIssues && (
          <View style={styles.validationWarningBox}>
            <View style={styles.validationWarningHeader}>
              <Icon name="alert-circle" size={18} color="#B45309" />
              <Text style={styles.validationWarningTitle}>Pedagogisk strukturrekommendation</Text>
            </View>
            {!hasIntro && (
              <Text style={styles.validationWarningText}>
                • Lektionen saknar ett introduktionsblock i början. Elever behöver en vardagssituation för att få sammanhang.
              </Text>
            )}
            {!hasSummary && (
              <Text style={styles.validationWarningText}>
                • Lektionen saknar ett sammanfattningsblock i slutet för att bekräfta lärandemålen.
              </Text>
            )}
            {introCount > 1 && (
              <Text style={[styles.validationWarningText, { color: '#DC2626' }]}>
                • OBS! Flera introduktionsblock upptäcktes. Endast en introduktion är tillåten.
              </Text>
            )}
            {summaryCount > 1 && (
              <Text style={[styles.validationWarningText, { color: '#DC2626' }]}>
                • OBS! Flera sammanfattningsblock upptäcktes. Endast en sammanfattning är tillåten.
              </Text>
            )}
          </View>
        )}

        {/* MISSION METADATA HEADER */}
        <View style={styles.missionHeaderCard}>
          {!isEditingMeta ? (
            <View>
              <View style={styles.metaTopRow}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>UPPDRAG {mission.order} • A1</Text>
                </View>
                <Pressable
                  style={styles.editMetaBtn}
                  onPress={() => setIsEditingMeta(true)}
                >
                  <Icon name="create-outline" size={14} color="#1E4E8C" />
                  <Text style={styles.editMetaBtnText}>Redigera uppgiftsinformation</Text>
                </Pressable>
              </View>

              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionDesc}>{mission.description}</Text>

              <View style={styles.metaPillsRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>⏱ {mission.estimatedMinutes || 7} minuter</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>⭐ {mission.totalPoints || 50} poäng</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>📚 {lesson?.blocks.length || 0} lektionsblock</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.metaEditForm}>
              <Text style={styles.formTitle}>Redigera uppgiftsinformation</Text>

              <Text style={styles.inputLabel}>Titel</Text>
              <TextInput
                style={styles.input}
                value={metaTitle}
                onChangeText={setMetaTitle}
              />

              <Text style={styles.inputLabel}>Beskrivning</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                multiline
                value={metaDesc}
                onChangeText={setMetaDesc}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Tidsåtgång (min)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={metaMinutes}
                    onChangeText={setMetaMinutes}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Poäng</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={metaPoints}
                    onChangeText={setMetaPoints}
                  />
                </View>
              </View>

              <View style={styles.formButtonsRow}>
                <Pressable
                  style={styles.cancelFormBtn}
                  onPress={() => setIsEditingMeta(false)}
                >
                  <Text style={styles.cancelFormBtnText}>Avbryt</Text>
                </Pressable>
                <Pressable
                  style={styles.saveFormBtn}
                  onPress={handleSaveMeta}
                >
                  <Text style={styles.saveFormBtnText}>Spara ändringar</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* BLOCKS SECTION HEADER */}
        <View style={styles.blocksHeaderRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.sectionTitle}>Lektionsstruktur & Innehållsplan</Text>
            <Text style={styles.sectionSubtitle}>
              Pedagogiskt ordnad flödeskedja från introduktion till sammanfattning.
            </Text>
          </View>

          {/* TWO CLEAR ADD BUTTONS */}
          <View style={styles.addButtonsGroup}>
            <Pressable
              style={styles.addContentButton}
              onPress={handleOpenAddContent}
              accessibilityRole="button"
            >
              <Icon name="book-outline" size={15} color="#1E4E8C" />
              <Text style={styles.addContentButtonText}>+ Lägg till innehåll</Text>
            </Pressable>

            <Pressable
              style={styles.addExerciseButton}
              onPress={handleOpenAddExercise}
              accessibilityRole="button"
            >
              <Icon name="create" size={15} color="#FFFFFF" />
              <Text style={styles.addExerciseButtonText}>+ Lägg till övning</Text>
            </Pressable>
          </View>
        </View>

        {/* ORDERED BLOCKS LIST */}
        <View style={styles.blocksList}>
          {lesson?.blocks.map((block, idx) => {
            const info = getBlockTypeInfo(block.type);
            const isIntro = block.type === 'introduction';
            const isSummary = block.type === 'summary';

            // Safe reorder rules:
            // Intro is always first, cannot move down
            // Summary is always last, cannot move up
            // Other blocks cannot move before intro or after summary
            const canMoveUp =
              idx > 0 &&
              !isSummary &&
              !(lesson.blocks[0].type === 'introduction' && idx === 1);

            const canMoveDown =
              idx < lesson.blocks.length - 1 &&
              !isIntro &&
              !(
                lesson.blocks[lesson.blocks.length - 1].type === 'summary' &&
                idx === lesson.blocks.length - 2
              );

            return (
              <View key={block.id} style={styles.blockCard}>
                <View style={styles.blockCardHeader}>
                  {/* REORDER BUTTONS */}
                  <View style={styles.blockReorderCol}>
                    <Pressable
                      style={[styles.smallArrow, !canMoveUp && styles.arrowDisabled]}
                      disabled={!canMoveUp}
                      onPress={() => handleMoveBlockUp(idx)}
                      accessibilityLabel="Flytta uppåt i lektionen"
                    >
                      <Text style={[styles.arrowText, !canMoveUp && styles.arrowTextDisabled]}>▲</Text>
                    </Pressable>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    <Pressable
                      style={[styles.smallArrow, !canMoveDown && styles.arrowDisabled]}
                      disabled={!canMoveDown}
                      onPress={() => handleMoveBlockDown(idx)}
                      accessibilityLabel="Flytta nedåt i lektionen"
                    >
                      <Text style={[styles.arrowText, !canMoveDown && styles.arrowTextDisabled]}>▼</Text>
                    </Pressable>
                  </View>

                  {/* BLOCK DETAILS */}
                  <View style={styles.blockInfoCol}>
                    <View style={styles.blockTypeBadgeRow}>
                      <View
                        style={[
                          styles.blockTypeBadge,
                          { backgroundColor: `${info.color}15`, borderColor: `${info.color}40` },
                        ]}
                      >
                        <Icon name={info.icon as any} size={14} color={info.color} />
                        <Text style={[styles.blockTypeBadgeText, { color: info.color }]}>
                          {info.displayCategory}
                        </Text>
                      </View>
                      <Text style={styles.blockIdTag}>Steg {idx + 1}</Text>
                    </View>

                    <Text style={styles.blockCardTitle}>
                      {(block as any).title ||
                        (block as any).exercise?.question ||
                        (block as any).exercise?.instruction ||
                        (block as any).exercise?.prompt ||
                        (block as any).exercise?.targetPhrase ||
                        (block as any).scenario ||
                        info.desc}
                    </Text>

                    {/* BRIEF PREVIEW */}
                    <Text style={styles.blockPreviewText} numberOfLines={2}>
                      {getBlockSummaryText(block)}
                    </Text>
                  </View>
                </View>

                {/* BLOCK ACTIONS */}
                <View style={styles.blockActionsRow}>
                  <Pressable
                    style={styles.blockActionBtn}
                    onPress={() => handleOpenEditBlock(block)}
                  >
                    <Icon name="create-outline" size={14} color="#1E4E8C" />
                    <Text style={styles.blockActionBtnText}>Redigera innehåll</Text>
                  </Pressable>

                  <Pressable
                    style={styles.blockActionBtn}
                    onPress={() => handleDuplicateBlock(block.id)}
                  >
                    <Icon name="book-outline" size={14} color="#64748B" />
                    <Text style={styles.blockActionBtnText}>Kopiera steg</Text>
                  </Pressable>

                  <Pressable
                    style={styles.blockActionBtn}
                    onPress={() => handleDeleteBlock(block.id, info.label)}
                  >
                    <Icon name="alert-circle" size={14} color="#DC2626" />
                    <Text style={[styles.blockActionBtnText, { color: '#DC2626' }]}>Radera</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* MODAL 1: ADD CONTENT / EXERCISE SELECTOR */}
        <Modal
          visible={addModalCategory !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setAddModalCategory(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, isTabletOrWeb && styles.modalBoxTablet]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalHeading}>
                    {addModalCategory === 'content'
                      ? 'Lägg till innehåll'
                      : 'Lägg till övning'}
                  </Text>
                  <Text style={styles.modalSubheading}>
                    {addModalCategory === 'content'
                      ? 'Välj pedagogiskt innehållsmoment att lägga till i lektionen'
                      : 'Välj interaktiv övningstyp att lägga till i lektionen'}
                  </Text>
                </View>
                <Pressable onPress={() => setAddModalCategory(null)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }}>
                {(addModalCategory === 'content'
                  ? (['introduction', 'dialogue', 'explanation', 'vocabulary', 'summary'] as LessonBlock['type'][])
                  : ([
                      'multiple_choice',
                      'sentence_builder',
                      'fill_blank',
                      'matching',
                      'listen_choice',
                      'free_text',
                      'speak',
                      'ai_roleplay',
                    ] as LessonBlock['type'][]))
                  .map((t) => {
                    const itemInfo = getBlockTypeInfo(t);
                    const isSelected = selectedNewType === t;
                    const isIntroAlready = t === 'introduction' && hasIntro;
                    const isSummaryAlready = t === 'summary' && hasSummary;
                    const isBlocked = isIntroAlready || isSummaryAlready;

                    return (
                      <Pressable
                        key={t}
                        disabled={isBlocked}
                        style={[
                          styles.typeOptionCard,
                          isSelected && styles.typeOptionCardActive,
                          isBlocked && styles.typeOptionCardDisabled,
                        ]}
                        onPress={() => !isBlocked && setSelectedNewType(t)}
                      >
                        <View style={[styles.typeIconBox, { backgroundColor: `${itemInfo.color}15` }]}>
                          <Icon name={itemInfo.icon as any} size={18} color={itemInfo.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.typeOptionTitle, isBlocked && { color: '#94A3B8' }]}>
                              {itemInfo.label}
                            </Text>
                            {isBlocked && (
                              <Text style={styles.typeOptionAlreadyBadge}>Finns redan</Text>
                            )}
                          </View>
                          <Text style={styles.typeOptionDesc}>{itemInfo.desc}</Text>
                        </View>
                        {isSelected && !isBlocked && <Text style={styles.checkMark}>✓</Text>}
                      </Pressable>
                    );
                  })}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setAddModalCategory(null)}
                >
                  <Text style={styles.cancelBtnText}>Avbryt</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmAddBtn}
                  onPress={handleConfirmAddBlock}
                >
                  <Text style={styles.confirmAddBtnText}>Lägg till & Konfigurera</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL 2: IN-DEPTH BLOCK CONTENT EDITOR */}
        <Modal
          visible={!!editingBlock}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingBlock(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, isTabletOrWeb && styles.modalBoxTablet]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeading}>
                  Redigera {editingBlock && getBlockTypeInfo(editingBlock.type).label}
                </Text>
                <Pressable onPress={() => setEditingBlock(null)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 460 }}>
                {editingBlock && (
                  <View>
                    {/* TITLE / HEADING */}
                    <Text style={styles.inputLabel}>Titel / Rubrik</Text>
                    <TextInput
                      style={styles.input}
                      value={blockForm.title || ''}
                      onChangeText={(t) => setBlockForm({ ...blockForm, title: t })}
                      placeholder="Stegrubrik..."
                    />

                    {/* INTRODUCTION SPECIFICS */}
                    {editingBlock.type === 'introduction' && (
                      <View>
                        <Text style={styles.inputLabel}>Introduktionstext</Text>
                        <TextInput
                          style={[styles.input, { height: 70 }]}
                          multiline
                          value={blockForm.introduction || ''}
                          onChangeText={(t) => setBlockForm({ ...blockForm, introduction: t })}
                        />
                        <Text style={styles.inputLabel}>Grammatisk / Språklig notis</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.grammaticalNote || ''}
                          onChangeText={(t) => setBlockForm({ ...blockForm, grammaticalNote: t })}
                        />
                      </View>
                    )}

                    {/* DIALOGUE SPECIFICS */}
                    {editingBlock.type === 'dialogue' && (
                      <View>
                        <Text style={styles.inputLabel}>Scenario / Sammanhang</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.scenario || ''}
                          onChangeText={(t) => setBlockForm({ ...blockForm, scenario: t })}
                          placeholder="t.ex. I receptionen på SFI-skolan"
                        />

                        <View style={{ marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.inputLabel}>Dialogrepliker ({Array.isArray(blockForm.lines) ? blockForm.lines.length : 0})</Text>
                          <Pressable
                            style={styles.addNestedItemBtn}
                            onPress={() => {
                              const currentLines = Array.isArray(blockForm.lines) ? [...blockForm.lines] : [];
                              currentLines.push({ speaker: 'Talare A', text: '', translation: '' });
                              setBlockForm({ ...blockForm, lines: currentLines });
                            }}
                          >
                            <Icon name="add" size={14} color="#1E4E8C" />
                            <Text style={styles.addNestedItemBtnText}>Lägg till replik</Text>
                          </Pressable>
                        </View>

                        {(blockForm.lines || []).map((line: any, lIdx: number) => (
                          <View key={lIdx} style={styles.nestedItemCard}>
                            <View style={styles.nestedItemHeader}>
                              <Text style={styles.nestedItemNumber}>Replik {lIdx + 1}</Text>
                              <Pressable
                                onPress={() => {
                                  const updated = (blockForm.lines || []).filter((_: any, i: number) => i !== lIdx);
                                  setBlockForm({ ...blockForm, lines: updated });
                                }}
                              >
                                <Text style={styles.removeNestedItemText}>✕ Ta bort</Text>
                              </Pressable>
                            </View>

                            <Text style={styles.subInputLabel}>Talare</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Anna eller Receptionist"
                              value={line.speaker || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.lines || [])];
                                updated[lIdx] = { ...updated[lIdx], speaker: t };
                                setBlockForm({ ...blockForm, lines: updated });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Text (svenska)</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Hej! Vad heter du?"
                              value={line.text || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.lines || [])];
                                updated[lIdx] = { ...updated[lIdx], text: t };
                                setBlockForm({ ...blockForm, lines: updated });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Översättning (valfritt)</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Hello! What is your name?"
                              value={line.translation || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.lines || [])];
                                updated[lIdx] = { ...updated[lIdx], translation: t };
                                setBlockForm({ ...blockForm, lines: updated });
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    )}

                    {/* VOCABULARY SPECIFICS */}
                    {editingBlock.type === 'vocabulary' && (
                      <View>
                        <Text style={styles.inputLabel}>Infobox / Tips till eleven</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.infoBox || ''}
                          onChangeText={(t) => setBlockForm({ ...blockForm, infoBox: t })}
                          placeholder="t.ex. Lär dig hälsa och ställa enkla frågor"
                        />

                        <View style={{ marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.inputLabel}>Ord och fraser ({Array.isArray(blockForm.phrases) ? blockForm.phrases.length : 0})</Text>
                          <Pressable
                            style={styles.addNestedItemBtn}
                            onPress={() => {
                              const currentPhrases = Array.isArray(blockForm.phrases) ? [...blockForm.phrases] : [];
                              currentPhrases.push({ phrase: '', translation: '', pronunciation: '' });
                              setBlockForm({ ...blockForm, phrases: currentPhrases });
                            }}
                          >
                            <Icon name="add" size={14} color="#1E4E8C" />
                            <Text style={styles.addNestedItemBtnText}>Lägg till ord</Text>
                          </Pressable>
                        </View>

                        {(blockForm.phrases || []).map((pItem: any, pIdx: number) => (
                          <View key={pIdx} style={styles.nestedItemCard}>
                            <View style={styles.nestedItemHeader}>
                              <Text style={styles.nestedItemNumber}>Ord / Fras {pIdx + 1}</Text>
                              <Pressable
                                onPress={() => {
                                  const updated = (blockForm.phrases || []).filter((_: any, i: number) => i !== pIdx);
                                  setBlockForm({ ...blockForm, phrases: updated });
                                }}
                              >
                                <Text style={styles.removeNestedItemText}>✕ Ta bort</Text>
                              </Pressable>
                            </View>

                            <Text style={styles.subInputLabel}>Svenskt ord / fras</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. god morgon"
                              value={pItem.phrase || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.phrases || [])];
                                updated[pIdx] = { ...updated[pIdx], phrase: t };
                                setBlockForm({ ...blockForm, phrases: updated });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Översättning</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. good morning"
                              value={pItem.translation || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.phrases || [])];
                                updated[pIdx] = { ...updated[pIdx], translation: t };
                                setBlockForm({ ...blockForm, phrases: updated });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Uttalsguide / Tips (valfritt)</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. goo moh-ron"
                              value={pItem.pronunciation || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.phrases || [])];
                                updated[pIdx] = { ...updated[pIdx], pronunciation: t };
                                setBlockForm({ ...blockForm, phrases: updated });
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    )}

                    {/* MULTIPLE CHOICE / LISTEN CHOICE */}
                    {(editingBlock.type === 'multiple_choice' || editingBlock.type === 'listen_choice') && (
                      <View>
                        <Text style={styles.inputLabel}>Fråga / Instruktion</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.question || blockForm.exercise?.prompt || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, question: t, prompt: t },
                            })
                          }
                        />

                        {editingBlock.type === 'listen_choice' && (
                          <View>
                            <Text style={styles.inputLabel}>Ljudtext (Vad som läses upp)</Text>
                            <TextInput
                              style={styles.input}
                              value={blockForm.exercise?.audioPlaceholderText || ''}
                              onChangeText={(t) =>
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, audioPlaceholderText: t },
                                })
                              }
                            />
                          </View>
                        )}

                        <Text style={styles.inputLabel}>Svarsalternativ (Kommaseparerade)</Text>
                        <TextInput
                          style={styles.input}
                          value={(blockForm.exercise?.options || []).join(', ')}
                          onChangeText={(t) => {
                            const arr = t.split(',').map((o) => o.trim());
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, options: arr },
                            })
                          }}
                        />

                        <Text style={styles.inputLabel}>Index för rätt svar (0 = första valet, 1 = andra...)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={String(blockForm.exercise?.correctIndex ?? 0)}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, correctIndex: parseInt(t, 10) || 0 },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Feedback vid rätt svar</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.explanationCorrect || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, explanationCorrect: t },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Feedback vid fel svar</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.explanationIncorrect || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, explanationIncorrect: t },
                            })
                          }
                        />
                      </View>
                    )}

                    {/* SENTENCE BUILDER */}
                    {editingBlock.type === 'sentence_builder' && (
                      <View>
                        <Text style={styles.inputLabel}>Instruktion</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.instruction || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, instruction: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Korrekt mening</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.correctSentence || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, correctSentence: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Tillgängliga ord (Kommaseparerade)</Text>
                        <TextInput
                          style={styles.input}
                          value={(blockForm.exercise?.initialWords || []).join(', ')}
                          onChangeText={(t) => {
                            const arr = t.split(',').map((w) => w.trim());
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, initialWords: arr },
                            })
                          }}
                        />
                      </View>
                    )}

                    {/* FILL BLANK */}
                    {editingBlock.type === 'fill_blank' && (
                      <View>
                        <Text style={styles.inputLabel}>Mening med lucka (använd {"{blank}"} eller _____)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Vad {blank} du?"
                          value={blockForm.exercise?.sentence || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, sentence: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Rätt ord som passar i luckan</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. heter"
                          value={blockForm.exercise?.correctAnswer || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, correctAnswer: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Alternativ (Kommaseparerade)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. heter, bor, kommer"
                          value={(blockForm.exercise?.options || []).join(', ')}
                          onChangeText={(t) => {
                            const arr = t.split(',').map((o) => o.trim());
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, options: arr },
                            })
                          }}
                        />
                      </View>
                    )}

                    {/* SPEAK STEP */}
                    {editingBlock.type === 'speak' && (
                      <View>
                        <Text style={styles.inputLabel}>Mening som eleven ska uttala</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.targetPhrase || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, targetPhrase: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Översättning</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.translation || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, translation: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Svensk stavelseindelning / uttalsstöd (ej engelsk fonetik)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. God mor-gon! Hur mår du?"
                          value={blockForm.exercise?.phoneticHint || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, phoneticHint: t },
                            })
                          }
                        />
                      </View>
                    )}

                    {/* AI ROLEPLAY */}
                    {editingBlock.type === 'ai_roleplay' && (
                      <View>
                        <Text style={styles.inputLabel}>Rubrik för dialogsteget</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Fika på café"
                          value={blockForm.exercise?.title || blockForm.title || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              title: t,
                              exercise: { ...blockForm.exercise, title: t },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Kort instruktion till eleven</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Öva på att beställa fika och fråga om pris."
                          value={blockForm.exercise?.instruction || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, instruction: t },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Scenario</Text>
                        <TextInput
                          style={[styles.input, { height: 60 }]}
                          multiline
                          placeholder="t.ex. Du är på ett svenskt café och ska beställa fika."
                          value={blockForm.exercise?.scenario || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, scenario: t },
                            })
                          }
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>AI-roll</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="t.ex. Cafépersonal"
                              value={blockForm.exercise?.characterRole || ''}
                              onChangeText={(t) =>
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, characterRole: t },
                                })
                              }
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Elevens roll</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="t.ex. Kund"
                              value={blockForm.exercise?.userRole || 'Kund'}
                              onChangeText={(t) =>
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, userRole: t },
                                })
                              }
                            />
                          </View>
                        </View>

                        <Text style={styles.inputLabel}>Karaktärens namn</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Emma"
                          value={blockForm.exercise?.characterName || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, characterName: t },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Språknivå</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                          <Pressable
                            style={[
                              styles.cancelBtn,
                              (blockForm.exercise?.languageLevel || 'A1') === 'A1' && {
                                backgroundColor: '#1E4E8C',
                              },
                            ]}
                            onPress={() =>
                              setBlockForm({
                                ...blockForm,
                                exercise: { ...blockForm.exercise, languageLevel: 'A1' },
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.cancelBtnText,
                                (blockForm.exercise?.languageLevel || 'A1') === 'A1' && {
                                  color: '#FFFFFF',
                                },
                              ]}
                            >
                              A1 (Nybörjare)
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.cancelBtn,
                              blockForm.exercise?.languageLevel === 'A2' && {
                                backgroundColor: '#1E4E8C',
                              },
                            ]}
                            onPress={() =>
                              setBlockForm({
                                ...blockForm,
                                exercise: { ...blockForm.exercise, languageLevel: 'A2' },
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.cancelBtnText,
                                blockForm.exercise?.languageLevel === 'A2' && {
                                  color: '#FFFFFF',
                                },
                              ]}
                            >
                              A2 (Grundläggande)
                            </Text>
                          </Pressable>
                        </View>

                        <Text style={styles.inputLabel}>Vad eleven ska träna på (Lärandemål)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Träna på att hälsa, beställa en fika och betala på svenska."
                          value={
                            blockForm.exercise?.learningGoal ||
                            blockForm.exercise?.goalDescription ||
                            ''
                          }
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: {
                                ...blockForm.exercise,
                                learningGoal: t,
                                goalDescription: t,
                              },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>
                          Föreslagna ord eller fraser (kommaseparerade)
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. En kaffe tack, Vad kostar det?, Med kort tack"
                          value={
                            Array.isArray(blockForm.exercise?.suggestedPhrases)
                              ? blockForm.exercise.suggestedPhrases.join(', ')
                              : ''
                          }
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: {
                                ...blockForm.exercise,
                                suggestedPhrases: t
                                  .split(',')
                                  .map((p: string) => p.trim())
                                  .filter(Boolean),
                              },
                            })
                          }
                        />

                        <Text style={styles.inputLabel}>Första replik från AI</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="t.ex. Hej och välkommen! Vad får det lov att vara?"
                          value={blockForm.exercise?.initialMessage || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, initialMessage: t },
                            })
                          }
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Max antal elevsvar (turer)</Text>
                            <TextInput
                              style={styles.input}
                              keyboardType="numeric"
                              placeholder="8"
                              value={String(blockForm.exercise?.maxTurns ?? 8)}
                              onChangeText={(t) => {
                                const num = parseInt(t, 10);
                                setBlockForm({
                                  ...blockForm,
                                  exercise: {
                                    ...blockForm.exercise,
                                    maxTurns: isNaN(num) ? 8 : Math.min(Math.max(num, 1), 10),
                                  },
                                });
                              }}
                            />
                          </View>
                          <View style={{ flex: 2 }}>
                            <Text style={styles.inputLabel}>Avslutningsregel</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="t.ex. När beställningen är slutförd"
                              value={blockForm.exercise?.exitRule || ''}
                              onChangeText={(t) =>
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, exitRule: t },
                                })
                              }
                            />
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#F8FAFC',
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            marginTop: 6,
                            marginBottom: 10,
                          }}
                        >
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                              Visa språklig återkoppling
                            </Text>
                            <Text style={{ fontSize: 11, color: '#64748B' }}>
                              Ger eleven tips och styrkor när dialogen avslutas.
                            </Text>
                          </View>
                          <Pressable
                            style={[
                              styles.cancelBtn,
                              (blockForm.exercise?.showFeedback !== false) && {
                                backgroundColor: '#059669',
                              },
                            ]}
                            onPress={() =>
                              setBlockForm({
                                ...blockForm,
                                exercise: {
                                  ...blockForm.exercise,
                                  showFeedback: blockForm.exercise?.showFeedback === false,
                                },
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.cancelBtnText,
                                (blockForm.exercise?.showFeedback !== false) && {
                                  color: '#FFFFFF',
                                },
                              ]}
                            >
                              {blockForm.exercise?.showFeedback !== false ? 'På' : 'Av'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* FREE TEXT */}
                    {editingBlock.type === 'free_text' && (
                      <View>
                        <Text style={styles.inputLabel}>Fråga / Skrivuppgift</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.prompt || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, prompt: t },
                            })
                          }
                        />
                        <Text style={styles.inputLabel}>Exempelstöd / Mall</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.hintExample || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, hintExample: t },
                            })
                          }
                        />
                      </View>
                    )}

                    {/* EXPLANATION */}
                    {editingBlock.type === 'explanation' && (
                      <View>
                        <Text style={styles.inputLabel}>Förklarande text</Text>
                        <TextInput
                          style={[styles.input, { height: 80 }]}
                          multiline
                          value={blockForm.body || blockForm.explanation || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              body: t,
                              explanation: t,
                            })
                          }
                          placeholder="Förklara språkregeln eller sammanhanget..."
                        />

                        <View style={{ marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.inputLabel}>Exempelmeningar ({Array.isArray(blockForm.examples) ? blockForm.examples.length : 0})</Text>
                          <Pressable
                            style={styles.addNestedItemBtn}
                            onPress={() => {
                              const currentEx = Array.isArray(blockForm.examples) ? [...blockForm.examples] : [];
                              currentEx.push({ phrase: '', translation: '' });
                              setBlockForm({ ...blockForm, examples: currentEx });
                            }}
                          >
                            <Icon name="add" size={14} color="#1E4E8C" />
                            <Text style={styles.addNestedItemBtnText}>Lägg till exempel</Text>
                          </Pressable>
                        </View>

                        {(blockForm.examples || []).map((exItem: any, exIdx: number) => (
                          <View key={exIdx} style={styles.nestedItemCard}>
                            <View style={styles.nestedItemHeader}>
                              <Text style={styles.nestedItemNumber}>Exempel {exIdx + 1}</Text>
                              <Pressable
                                onPress={() => {
                                  const updated = (blockForm.examples || []).filter((_: any, i: number) => i !== exIdx);
                                  setBlockForm({ ...blockForm, examples: updated });
                                }}
                              >
                                <Text style={styles.removeNestedItemText}>✕ Ta bort</Text>
                              </Pressable>
                            </View>

                            <Text style={styles.subInputLabel}>Svensk fras</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Vad heter du?"
                              value={exItem.phrase || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.examples || [])];
                                updated[exIdx] = { ...updated[exIdx], phrase: t };
                                setBlockForm({ ...blockForm, examples: updated });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Översättning (valfritt)</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. What is your name?"
                              value={exItem.translation || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.examples || [])];
                                updated[exIdx] = { ...updated[exIdx], translation: t };
                                setBlockForm({ ...blockForm, examples: updated });
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    )}

                    {/* MATCHING */}
                    {editingBlock.type === 'matching' && (
                      <View>
                        <Text style={styles.inputLabel}>Instruktion för eleven</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.exercise?.instruction || ''}
                          onChangeText={(t) =>
                            setBlockForm({
                              ...blockForm,
                              exercise: { ...blockForm.exercise, instruction: t },
                            })
                          }
                          placeholder="t.ex. Para ihop fråga och rätt svar"
                        />

                        <View style={{ marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.inputLabel}>Matchningspar ({Array.isArray(blockForm.exercise?.pairs) ? blockForm.exercise.pairs.length : 0})</Text>
                          <Pressable
                            style={styles.addNestedItemBtn}
                            onPress={() => {
                              const currentPairs = Array.isArray(blockForm.exercise?.pairs) ? [...blockForm.exercise.pairs] : [];
                              currentPairs.push({ id: `p_${Date.now()}`, question: '', answer: '' });
                              setBlockForm({
                                ...blockForm,
                                exercise: { ...blockForm.exercise, pairs: currentPairs },
                              });
                            }}
                          >
                            <Icon name="add" size={14} color="#1E4E8C" />
                            <Text style={styles.addNestedItemBtnText}>Lägg till par</Text>
                          </Pressable>
                        </View>

                        {(blockForm.exercise?.pairs || []).map((pairItem: any, pIdx: number) => (
                          <View key={pIdx} style={styles.nestedItemCard}>
                            <View style={styles.nestedItemHeader}>
                              <Text style={styles.nestedItemNumber}>Par {pIdx + 1}</Text>
                              <Pressable
                                onPress={() => {
                                  const updated = (blockForm.exercise?.pairs || []).filter((_: any, i: number) => i !== pIdx);
                                  setBlockForm({
                                    ...blockForm,
                                    exercise: { ...blockForm.exercise, pairs: updated },
                                  });
                                }}
                              >
                                <Text style={styles.removeNestedItemText}>✕ Ta bort</Text>
                              </Pressable>
                            </View>

                            <Text style={styles.subInputLabel}>Vänster del / Fråga</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Hur mår du?"
                              value={pairItem.question || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.exercise?.pairs || [])];
                                updated[pIdx] = { ...updated[pIdx], question: t };
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, pairs: updated },
                                });
                              }}
                            />

                            <Text style={styles.subInputLabel}>Höger del / Rätt svar</Text>
                            <TextInput
                              style={styles.subInput}
                              placeholder="t.ex. Bra tack!"
                              value={pairItem.answer || ''}
                              onChangeText={(t) => {
                                const updated = [...(blockForm.exercise?.pairs || [])];
                                updated[pIdx] = { ...updated[pIdx], answer: t };
                                setBlockForm({
                                  ...blockForm,
                                  exercise: { ...blockForm.exercise, pairs: updated },
                                });
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    )}

                    {/* SUMMARY */}
                    {editingBlock.type === 'summary' && (
                      <View>
                        <Text style={styles.inputLabel}>Underrubrik / Uppmuntran</Text>
                        <TextInput
                          style={styles.input}
                          value={blockForm.subtitle || ''}
                          onChangeText={(t) => setBlockForm({ ...blockForm, subtitle: t })}
                          placeholder="t.ex. Bra jobbat med uppdraget!"
                        />

                        <Text style={styles.inputLabel}>Sammanfattningspunkter (Kommaseparerade)</Text>
                        <TextInput
                          style={[styles.input, { height: 60 }]}
                          multiline
                          value={(blockForm.summaryPhrases || []).join(', ')}
                          onChangeText={(t) => {
                            const arr = t.split(',').map((s) => s.trim()).filter(Boolean);
                            setBlockForm({ ...blockForm, summaryPhrases: arr });
                          }}
                          placeholder="t.ex. Övat på hälsningsfraser, Förstått enkla frågor"
                        />
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setEditingBlock(null)}
                >
                  <Text style={styles.cancelBtnText}>Avbryt</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmAddBtn}
                  onPress={handleSaveBlockEdit}
                >
                  <Text style={styles.confirmAddBtnText}>Spara ändringar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: theme.spacing.md,
  },
  workflowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  workflowStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  workflowStepItemActive: {
    opacity: 1,
  },
  workflowStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowStepBadgeActive: {
    backgroundColor: '#1E4E8C',
  },
  workflowStepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  workflowStepNumActive: {
    color: '#FFFFFF',
  },
  workflowStepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  workflowStepTitleActive: {
    color: '#1E293B',
    fontWeight: '700',
  },
  workflowConnector: {
    width: 16,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  validationWarningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  validationWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  validationWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  validationWarningText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  addButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  addContentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addContentButtonText: {
    color: '#1E4E8C',
    fontSize: 13,
    fontWeight: '700',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  arrowTextDisabled: {
    color: '#94A3B8',
  },
  modalSubheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8FAFC',
  },
  typeOptionAlreadyBadge: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#E2E8F0',
    color: '#64748B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  headerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  publishToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  publishToggleBtnLive: {
    backgroundColor: '#ECFDF5',
  },
  publishToggleBtnDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  publishToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  missionHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: theme.spacing.lg,
  },
  metaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  editMetaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editMetaBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  missionDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  metaEditForm: {
    gap: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  inputRow: {
    flexDirection: 'row',
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelFormBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelFormBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveFormBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1E4E8C',
  },
  saveFormBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  blocksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addBlockButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  blocksList: {
    gap: 10,
  },
  blockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  blockCardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  blockReorderCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    gap: 2,
  },
  smallArrow: {
    padding: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 10,
    color: '#1E4E8C',
    fontWeight: '700',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  blockInfoCol: {
    flex: 1,
  },
  blockTypeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  blockTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 6,
  },
  typeColorBar: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  blockIdTag: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  blockCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  blockPreviewText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  blockActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 8,
    gap: 8,
  },
  blockActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  blockActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  modalBoxTablet: {
    maxWidth: 620,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 12,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeX: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  typeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  typeOptionCardActive: {
    borderColor: '#1E4E8C',
    backgroundColor: '#F0F7FF',
  },
  typeColorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  typeOptionDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E4E8C',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1E4E8C',
  },
  confirmAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
  },
  addNestedItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  addNestedItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  nestedItemCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  nestedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 4,
  },
  nestedItemNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  removeNestedItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  subInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 3,
    marginTop: 4,
  },
  subInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 6,
  },
});
