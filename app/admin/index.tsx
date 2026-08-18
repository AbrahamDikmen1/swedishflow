import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/theme';
import Icon from '../../src/components/Icon';
import Button from '../../src/components/Button';
import Logo from '../../src/components/Logo';
import { useCourse } from '../../src/context/CourseContext';
import { useAuth } from '../../src/context/AuthContext';
import { Mission } from '../../src/types/mission';
import { StudentProgressSummary } from '../../src/services/courseService';

export default function AdminOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isSmallMobile = width < 380;
  const isTabletOrWeb = width >= 768;

  const { user, isAdmin, isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const {
    missions,
    createMission,
    deleteMission,
    duplicateMission,
    reorderMissions,
    togglePublishMission,
    getStudentAnalytics,
    isLoading,
  } = useCourse();

  const [activeTab, setActiveTab] = useState<'missions' | 'students'>('missions');
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublish, setFilterPublish] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State for Creating/Editing Mission
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMinutes, setNewMinutes] = useState('7');
  const [newSkills, setNewSkills] = useState('Vokabulär, Fraser');
  const [newGoals, setNewGoals] = useState('Lär dig grunderna');
  const [newOutcomes, setNewOutcomes] = useState('Kan använda fraserna i vardagen');
  const [newIsPublished, setNewIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingStudents(true);
    setStudentsError(null);
    try {
      const data = await getStudentAnalytics();
      setStudents(data);
    } catch (err: any) {
      console.warn('Failed to load students:', err);
      setStudentsError(err.message || 'Kunde inte läsa in elevstatistik från databasen.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [isAdmin, getStudentAnalytics]);

  useEffect(() => {
    if (isAdmin) {
      loadStudents();
    }
  }, [isAdmin, loadStudents]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/admin/login');
  };

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Icon name="shield-checkmark-outline" size={48} color="#1E4E8C" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 16, textAlign: 'center' }}>
            Kontrollerar administratörsbehörighet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Icon name="shield-checkmark-outline" size={48} color="#1E4E8C" />
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 16, textAlign: 'center' }}>
            Administratörsbehörighet krävs
          </Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, maxWidth: 360, lineHeight: 22 }}>
            {isAuthenticated
              ? `Inloggad som ${user?.email || 'elev'}. Detta konto saknar administratörsbehörighet.`
              : 'Du måste vara inloggad med ett administratörs- eller lärarkonto för att hantera kursinnehåll och visa elevstatistik.'}
          </Text>
          <View style={{ width: '100%', maxWidth: 280, marginTop: 24, gap: 10 }}>
            <Button
              title="Logga in som admin"
              onPress={() => router.push('/admin/login')}
            />
            <Button
              title="Tillbaka till elevvyn"
              variant="secondary"
              onPress={() => router.push('/(tabs)/learn')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewDesc('');
    setNewMinutes('7');
    setNewSkills('Vokabulär, Fraser');
    setNewGoals('Lär dig grunderna');
    setNewOutcomes('Kan använda fraserna i vardagen');
    setNewIsPublished(false);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleSaveNewMission = async () => {
    if (isSubmitting) return;

    if (!newTitle.trim()) {
      setFormError('Vänligen ange en titel för uppdraget.');
      return;
    }

    if (!newDesc.trim()) {
      setFormError('Vänligen ange en beskrivning för eleven.');
      return;
    }

    const minutesNum = parseInt(newMinutes, 10);
    if (isNaN(minutesNum) || minutesNum < 1) {
      setFormError('Tidsåtgången måste vara minst 1 minut.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const skillsArr = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const goalsArr = newGoals.split(',').map((s) => s.trim()).filter(Boolean);
      const outcomesArr = newOutcomes.split(',').map((s) => s.trim()).filter(Boolean);

      const created = await createMission({
        title: newTitle.trim(),
        description: newDesc.trim(),
        estimatedMinutes: minutesNum || 7,
        skills: skillsArr.length > 0 ? skillsArr : ['Vokabulär'],
        goals: goalsArr.length > 0 ? goalsArr : ['Lär dig nya ord'],
        knowledgeOutcomes: outcomesArr.length > 0 ? outcomesArr : ['Kan använda fraserna'],
        isPublished: newIsPublished,
        totalPoints: 50,
      });

      setShowCreateModal(false);
      setFormError(null);
      // Navigate to the newly created mission editor
      router.push(`/admin/mission/${created.id}`);
    } catch (err: any) {
      setFormError(err?.message || 'Kunde inte skapa uppdraget. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm(`Är du säker på att du vill radera uppdraget "${title}"?`)
      : true;

    if (confirmed) {
      try {
        await deleteMission(id);
      } catch (e: any) {
        alert(e?.message || 'Kunde inte radera uppdraget.');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await duplicateMission(id);
      if (dup) {
        router.push(`/admin/mission/${dup.id}`);
      }
    } catch (e: any) {
      alert(e?.message || 'Kunde inte duplicera uppdraget.');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...missions];
    const item = newOrder.splice(index, 1)[0];
    newOrder.splice(index - 1, 0, item);
    await reorderMissions(newOrder.map((m) => m.id));
  };

  const handleMoveDown = async (index: number) => {
    if (index === missions.length - 1) return;
    const newOrder = [...missions];
    const item = newOrder.splice(index, 1)[0];
    newOrder.splice(index + 1, 0, item);
    await reorderMissions(newOrder.map((m) => m.id));
  };

  // Filter missions
  const filteredMissions = missions.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterPublish === 'published') return m.isPublished !== false;
    if (filterPublish === 'draft') return m.isPublished === false;
    return true;
  });

  const totalMissionsCount = missions.length;
  const publishedCount = missions.filter((m) => m.isPublished !== false).length;
  const draftCount = totalMissionsCount - publishedCount;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 20) + 50 },
        ]}
      >
        {/* TOP ADMIN HEADER */}
        <View style={[styles.header, isSmallMobile && styles.headerSmallMobile]}>
          <View style={styles.headerTitleRow}>
            <Logo size="sm" />
            <View style={styles.adminTag}>
              <Icon name="shield-checkmark-outline" size={13} color="#FFFFFF" />
              <Text style={styles.adminTagText}>ADMIN</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.studentViewBtn}
              onPress={() => router.push('/(tabs)/learn')}
              accessibilityRole="button"
            >
              <Icon name="book-outline" size={14} color="#1E4E8C" />
              <Text style={styles.studentViewBtnText}>Elevvy</Text>
            </Pressable>

            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityRole="button"
            >
              <Icon name="person-outline" size={14} color="#DC2626" />
              <Text style={styles.logoutButtonText}>Logga ut</Text>
            </Pressable>
          </View>
        </View>

        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Kursadministration: SFI A1</Text>
          <Text style={styles.pageSubtitle}>
            Skapa, redigera, duplicera och publicera uppdrag samt följ elevernas progression i realtid.
          </Text>
        </View>

        {/* DASHBOARD STATS GRID */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Text style={styles.statNumber}>{totalMissionsCount}</Text>
            <Text style={styles.statLabel}>Totalt antal uppdrag</Text>
            <Text style={styles.statDetail}>SFI A1 Struktur</Text>
          </View>

          <View style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Text style={styles.statNumber}>{publishedCount}</Text>
            <Text style={styles.statLabel}>Publicerade uppdrag</Text>
            <Text style={styles.statDetail}>Synliga för elever</Text>
          </View>

          <View style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Text style={styles.statNumber}>{draftCount}</Text>
            <Text style={styles.statLabel}>Utkast / Opublicerade</Text>
            <Text style={styles.statDetail}>Under utveckling</Text>
          </View>

          <View style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Text style={styles.statNumber}>
              {isLoadingStudents ? '...' : studentsError ? '–' : students.length}
            </Text>
            <Text style={styles.statLabel}>Registrerade elever</Text>
            <Text style={styles.statDetail}>Aktiva i kursen</Text>
          </View>
        </View>

        {/* NAVIGATION TABS */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, activeTab === 'missions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('missions')}
          >
            <Icon
              name="book"
              size={15}
              color={activeTab === 'missions' ? '#1E4E8C' : '#64748B'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'missions' && styles.tabButtonTextActive]}
            >
              {isSmallMobile ? `Uppdrag (${totalMissionsCount})` : `Uppdrag & Övningar (${totalMissionsCount})`}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'students' && styles.tabButtonActive]}
            onPress={() => setActiveTab('students')}
          >
            <Icon
              name="person"
              size={15}
              color={activeTab === 'students' ? '#1E4E8C' : '#64748B'}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'students' && styles.tabButtonTextActive]}
            >
              Elevframsteg ({isLoadingStudents ? '...' : students.length})
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: MISSIONS CRUD & MANAGEMENT */}
        {activeTab === 'missions' && (
          <View style={styles.tabContent}>
            {/* TOOLBAR */}
            <View style={[styles.toolbarRow, isTabletOrWeb && styles.toolbarRowTablet]}>
              <View style={styles.searchWrapper}>
                <Icon name="search-outline" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök bland uppdrag och innehåll..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.filterRow}>
                <Pressable
                  style={[styles.filterChip, filterPublish === 'all' && styles.filterChipActive]}
                  onPress={() => setFilterPublish('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterPublish === 'all' && styles.filterChipTextActive,
                    ]}
                  >
                    Alla ({totalMissionsCount})
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.filterChip, filterPublish === 'published' && styles.filterChipActive]}
                  onPress={() => setFilterPublish('published')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterPublish === 'published' && styles.filterChipTextActive,
                    ]}
                  >
                    Publicerade ({publishedCount})
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.filterChip, filterPublish === 'draft' && styles.filterChipActive]}
                  onPress={() => setFilterPublish('draft')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterPublish === 'draft' && styles.filterChipTextActive,
                    ]}
                  >
                    Utkast ({draftCount})
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.createMissionButton}
                onPress={handleOpenCreateModal}
                accessibilityRole="button"
              >
                <Icon name="create" size={16} color="#FFFFFF" />
                <Text style={styles.createMissionButtonText}>+ Nytt uppdrag</Text>
              </Pressable>
            </View>

            {/* MISSIONS LIST */}
            <View style={styles.missionsList}>
              {filteredMissions.map((mission, idx) => {
                const isPublished = mission.isPublished !== false;
                return (
                  <View key={mission.id} style={styles.missionCard}>
                    <View style={styles.missionCardMain}>
                      {/* ORDER CONTROLS */}
                      <View style={styles.reorderCol}>
                        <Pressable
                          style={[styles.orderArrow, idx === 0 && styles.orderArrowDisabled]}
                          disabled={idx === 0}
                          onPress={() => handleMoveUp(idx)}
                          accessibilityLabel="Flytta upp"
                        >
                          <Text style={styles.arrowText}>▲</Text>
                        </Pressable>
                        <Text style={styles.orderNumberDisplay}>{mission.order}</Text>
                        <Pressable
                          style={[
                            styles.orderArrow,
                            idx === filteredMissions.length - 1 && styles.orderArrowDisabled,
                          ]}
                          disabled={idx === filteredMissions.length - 1}
                          onPress={() => handleMoveDown(idx)}
                          accessibilityLabel="Flytta ner"
                        >
                          <Text style={styles.arrowText}>▼</Text>
                        </Pressable>
                      </View>

                      {/* CONTENT */}
                      <View style={styles.missionInfoCol}>
                        <View style={styles.missionBadgeRow}>
                          <View style={styles.levelTag}>
                            <Text style={styles.levelTagText}>A1 • Uppdrag {mission.order}</Text>
                          </View>
                          <Pressable
                            style={[
                              styles.publishTag,
                              isPublished ? styles.publishTagLive : styles.publishTagDraft,
                            ]}
                            onPress={() => togglePublishMission(mission.id, !isPublished)}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: isPublished ? '#10B981' : '#F59E0B' },
                              ]}
                            />
                            <Text
                              style={[
                                styles.publishTagText,
                                { color: isPublished ? '#065F46' : '#92400E' },
                              ]}
                            >
                              {isPublished ? 'Publicerad' : 'Utkast (Dold)'}
                            </Text>
                          </Pressable>
                          <Text style={styles.timeEstimateText}>
                            ⏱ {mission.estimatedMinutes} min • {mission.totalPoints || 50} p
                          </Text>
                        </View>

                        <Text style={styles.missionCardTitle}>{mission.title}</Text>
                        <Text style={styles.missionCardDesc}>{mission.description}</Text>

                        {/* SKILLS TAGS */}
                        {mission.skills && mission.skills.length > 0 && (
                          <View style={styles.skillsRow}>
                            {mission.skills.map((skill, sIdx) => (
                              <View key={sIdx} style={styles.skillChip}>
                                <Text style={styles.skillChipText}>{skill}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* ACTIONS FOOTER */}
                    <View style={styles.missionActionsRow}>
                      <Pressable
                        style={styles.actionIconButton}
                        onPress={() => router.push(`/admin/mission/${mission.id}`)}
                      >
                        <Icon name="create-outline" size={15} color="#1E4E8C" />
                        <Text style={styles.actionIconText}>Redigera innehåll & övningar</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionIconButton}
                        onPress={() => router.push(`/learn/a1/mission/${mission.id}`)}
                      >
                        <Icon name="play" size={15} color="#0D9488" />
                        <Text style={[styles.actionIconText, { color: '#0D9488' }]}>Provkör</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionIconButton}
                        onPress={() => handleDuplicate(mission.id)}
                      >
                        <Icon name="book-outline" size={15} color="#64748B" />
                        <Text style={styles.actionIconText}>Kopiera</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionIconButton}
                        onPress={() => handleDelete(mission.id, mission.title)}
                      >
                        <Icon name="alert-circle" size={15} color="#DC2626" />
                        <Text style={[styles.actionIconText, { color: '#DC2626' }]}>Radera</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: STUDENT PROGRESS & ANALYTICS */}
        {activeTab === 'students' && (
          <View style={styles.tabContent}>
            <View style={styles.studentAnalyticsCard}>
              <View style={styles.analyticsHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.analyticsTitle}>Översikt: Registrerade elever</Text>
                  <Text style={styles.analyticsSub}>
                    Realtidsstatistik över aktiva elevers framsteg, poäng och slutförda uppdrag.
                  </Text>
                </View>
                <Pressable
                  style={[styles.refreshStudentsBtn, isLoadingStudents && { opacity: 0.6 }]}
                  disabled={isLoadingStudents}
                  onPress={loadStudents}
                >
                  <Icon name="refresh-outline" size={14} color="#1E4E8C" />
                  <Text style={styles.refreshStudentsBtnText}>
                    {isLoadingStudents ? 'Hämtar...' : 'Uppdatera'}
                  </Text>
                </Pressable>
              </View>

              {/* LOADING STATE */}
              {isLoadingStudents && (
                <View style={styles.studentsStatusBox}>
                  <Icon name="sync-outline" size={24} color="#1E4E8C" />
                  <Text style={styles.studentsStatusText}>
                    Hämtar aktuell elevstatistik från databasen...
                  </Text>
                </View>
              )}

              {/* ERROR STATE */}
              {!isLoadingStudents && studentsError && (
                <View style={styles.studentsErrorBox}>
                  <Icon name="alert-circle" size={24} color="#DC2626" />
                  <Text style={styles.studentsErrorTitle}>Kunde inte läsa in elever</Text>
                  <Text style={styles.studentsErrorText}>{studentsError}</Text>
                  <Pressable style={styles.retryBtn} onPress={loadStudents}>
                    <Text style={styles.retryBtnText}>Försök igen</Text>
                  </Pressable>
                </View>
              )}

              {/* EMPTY STATE */}
              {!isLoadingStudents && !studentsError && students.length === 0 && (
                <View style={styles.studentsStatusBox}>
                  <Icon name="people-outline" size={36} color="#94A3B8" />
                  <Text style={styles.studentsEmptyTitle}>Inga registrerade elever ännu</Text>
                  <Text style={styles.studentsEmptySub}>
                    När nya elever skapar konto och börjar öva i appen visas deras framsteg, resultat och poäng automatiskt här.
                  </Text>
                </View>
              )}

              {/* STUDENT CARDS / TABLE */}
              {!isLoadingStudents && !studentsError && students.length > 0 && (
                <View>
                  {isMobile ? (
                    // MOBILE VIEW: CARDS
                    <View style={styles.studentCardsList}>
                      {students.map((std) => {
                        const completionRate = totalMissionsCount > 0
                          ? Math.round((std.completedMissionsCount / totalMissionsCount) * 100)
                          : 0;
                        return (
                          <View key={std.userId} style={styles.studentMobileCard}>
                            <View style={styles.stdCardTopRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.studentName}>{std.fullName}</Text>
                                <Text style={styles.studentEmail}>{std.email}</Text>
                              </View>
                              <View style={styles.stdLevelBadge}>
                                <Text style={styles.stdLevelText}>{std.level}</Text>
                              </View>
                            </View>

                            <View style={styles.stdCardProgressRow}>
                              <Text style={styles.completionText}>
                                {std.completedMissionsCount} av {totalMissionsCount} klara ({completionRate}%)
                              </Text>
                              <View style={styles.miniProgressBar}>
                                <View
                                  style={[styles.miniProgressFill, { width: `${Math.min(completionRate, 100)}%` }]}
                                />
                              </View>
                            </View>

                            <View style={styles.stdCardStatsRow}>
                              <View style={styles.stdBadgePill}>
                                <Text style={styles.stdBadgePillText}>⭐ {std.totalPoints} p</Text>
                              </View>
                              <View style={styles.stdBadgePill}>
                                <Text style={styles.stdBadgePillText}>🔥 {std.currentStreak} d streak</Text>
                              </View>
                              <Text style={styles.stdLastActiveMobile}>Aktiv: {std.lastActive}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    // TABLET / DESKTOP VIEW: FULL TABLE
                    <View>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.thText, { flex: 2 }]}>Elev</Text>
                        <Text style={[styles.thText, { flex: 1 }]}>Nivå</Text>
                        <Text style={[styles.thText, { flex: 1.5 }]}>Klara uppdrag</Text>
                        <Text style={[styles.thText, { flex: 1 }]}>Poäng</Text>
                        <Text style={[styles.thText, { flex: 1 }]}>Streak</Text>
                        <Text style={[styles.thText, { flex: 1.5 }]}>Senast aktiv</Text>
                      </View>

                      {students.map((std) => {
                        const completionRate = totalMissionsCount > 0
                          ? Math.round((std.completedMissionsCount / totalMissionsCount) * 100)
                          : 0;
                        return (
                          <View key={std.userId} style={styles.tableRow}>
                            <View style={{ flex: 2 }}>
                              <Text style={styles.studentName}>{std.fullName}</Text>
                              <Text style={styles.studentEmail}>{std.email}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={styles.stdLevelBadge}>
                                <Text style={styles.stdLevelText}>{std.level}</Text>
                              </View>
                            </View>
                            <View style={{ flex: 1.5 }}>
                              <Text style={styles.completionText}>
                                {std.completedMissionsCount} / {totalMissionsCount} ({completionRate}%)
                              </Text>
                              <View style={styles.miniProgressBar}>
                                <View
                                  style={[styles.miniProgressFill, { width: `${Math.min(completionRate, 100)}%` }]}
                                />
                              </View>
                            </View>
                            <Text style={[styles.tdText, { flex: 1, fontWeight: '700', color: '#1E4E8C' }]}>
                              {std.totalPoints} p
                            </Text>
                            <Text style={[styles.tdText, { flex: 1 }]}>🔥 {std.currentStreak} d</Text>
                            <Text style={[styles.tdText, { flex: 1.5, color: '#64748B' }]}>{std.lastActive}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* MODAL: CREATE MISSION */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowCreateModal(false);
            setFormError(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isTabletOrWeb && styles.modalContentTablet]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="add" size={20} color="#1E4E8C" />
                  <Text style={styles.modalTitle}>Skapa nytt uppdrag</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setShowCreateModal(false);
                    setFormError(null);
                  }}
                  hitSlop={8}
                  accessibilityLabel="Stäng dialog"
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                {formError && (
                  <View style={styles.formErrorBanner}>
                    <Icon name="alert-circle" size={18} color="#DC2626" />
                    <Text style={styles.formErrorText}>{formError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Uppdragets titel *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="t.ex. Fråga om vägen i stan"
                  value={newTitle}
                  onChangeText={(t) => {
                    setNewTitle(t);
                    if (formError) setFormError(null);
                  }}
                  returnKeyType="next"
                />

                <Text style={styles.inputLabel}>Beskrivning för eleven *</Text>
                <TextInput
                  style={[styles.textInput, { height: 70 }]}
                  placeholder="Kort sammanfattning av vad eleven ska träna på..."
                  multiline
                  value={newDesc}
                  onChangeText={(t) => {
                    setNewDesc(t);
                    if (formError) setFormError(null);
                  }}
                />

                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>Tidsåtgång (minuter)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={newMinutes}
                      onChangeText={setNewMinutes}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>Publiceringsstatus</Text>
                    <Pressable
                      style={[
                        styles.toggleBtn,
                        newIsPublished ? styles.toggleBtnActive : styles.toggleBtnInactive,
                      ]}
                      onPress={() => setNewIsPublished(!newIsPublished)}
                    >
                      <Text style={styles.toggleBtnText}>
                        {newIsPublished ? '✓ Publicerad' : '✕ Utkast'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Färdigheter (kommaseparerade)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Vokabulär, Fraser"
                  value={newSkills}
                  onChangeText={setNewSkills}
                />

                <Text style={styles.inputLabel}>Lärandemål</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fråga 'Var ligger...?', Förstå enkla vägbeskrivningar"
                  value={newGoals}
                  onChangeText={setNewGoals}
                />

                <Text style={styles.inputLabel}>Förväntat kunskapsresultat</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Kan hitta till apoteket eller stationen på svenska"
                  value={newOutcomes}
                  onChangeText={setNewOutcomes}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveNewMission}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowCreateModal(false);
                    setFormError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Avbryt</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]}
                  disabled={isSubmitting}
                  onPress={handleSaveNewMission}
                >
                  <Text style={styles.saveBtnText}>
                    {isSubmitting ? 'Skapar...' : 'Skapa och öppna'}
                  </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerSmallMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  adminTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  studentViewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  titleSection: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardMobile: {
    flexBasis: '47%',
    minWidth: 130,
    padding: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E4E8C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statDetail: {
    fontSize: 11,
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 10,
    marginBottom: theme.spacing.md,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 5,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#1E4E8C',
    fontWeight: '700',
  },
  tabContent: {
    marginTop: 4,
  },
  toolbarRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  toolbarRowTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1E4E8C',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  createMissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E4E8C',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    gap: 6,
    justifyContent: 'center',
  },
  createMissionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  missionsList: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  missionCardMain: {
    flexDirection: 'row',
    gap: 10,
  },
  reorderCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    gap: 2,
  },
  orderArrow: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  orderArrowDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 11,
    color: '#1E4E8C',
    fontWeight: '700',
  },
  orderNumberDisplay: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  missionInfoCol: {
    flex: 1,
  },
  missionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  levelTag: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  publishTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  publishTagLive: {
    backgroundColor: '#ECFDF5',
  },
  publishTagDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  publishTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeEstimateText: {
    fontSize: 11,
    color: '#64748B',
  },
  missionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  missionCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 10,
    color: '#475569',
  },
  missionActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 10,
    gap: 6,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  studentAnalyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  analyticsSub: {
    fontSize: 12,
    color: '#64748B',
  },
  refreshStudentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  refreshStudentsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  studentsStatusBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 14,
    gap: 10,
  },
  studentsStatusText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  studentsEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  studentsEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 18,
  },
  studentsErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  studentsErrorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  studentsErrorText: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  studentCardsList: {
    gap: 10,
  },
  studentMobileCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  stdCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  stdCardProgressRow: {
    gap: 4,
  },
  stdCardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stdBadgePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stdBadgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E4E8C',
  },
  stdLastActiveMobile: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 'auto',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  thText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  studentEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  stdLevelBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stdLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E4E8C',
  },
  completionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  tdText: {
    fontSize: 12,
    color: '#1E293B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  modalContentTablet: {
    maxWidth: 580,
    padding: 20,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  modalBody: {
    maxHeight: 450,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 3,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#1E293B',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  toggleBtnInactive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E4E8C',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  formErrorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
