import AsyncStorage from '@react-native-async-storage/async-storage';
import { a1Missions, a1Lessons, a1Chapters } from '../data/a1CourseData';
import { Mission } from '../types/mission';
import { Chapter } from '../types/chapter';
import { LessonBlock, LessonData } from '../types/lesson';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MISSIONS_STORAGE_KEY = '@swedishflow_custom_missions_v2';
const LESSONS_STORAGE_KEY = '@swedishflow_custom_lessons_v2';
const STUDENTS_STORAGE_KEY = '@swedishflow_student_records_v2';

export interface StudentProgressSummary {
  userId: string;
  fullName: string;
  email: string;
  completedMissionsCount: number;
  totalPoints: number;
  currentStreak: number;
  lastActive: string;
  level: string;
}

class CourseService {
  private memoryMissions: Mission[] = [...a1Missions];
  private memoryLessons: Record<string, LessonData> = { ...a1Lessons };

  /**
   * Initializes or loads missions and lesson blocks from persistent store
   */
  async loadMissions(): Promise<Mission[]> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .order('order_num', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Mission[] = data.map((row: any) => ({
            id: String(row.id),
            order: row.order_num,
            title: row.title,
            description: row.description,
            status: 'locked',
            estimatedMinutes: row.estimated_minutes,
            levelCode: row.level_code,
            skills: row.skills || [],
            route: `/learn/a1/mission/${row.id}`,
            isPublished: row.is_published,
            goals: row.goals || [],
            knowledgeOutcomes: row.knowledge_outcomes || [],
            totalPoints: row.total_points || 50,
          }));
          this.memoryMissions = mapped;
          return mapped;
        }
      }

      // Check AsyncStorage
      const stored = await AsyncStorage.getItem(MISSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryMissions = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load dynamic missions from storage:', e);
    }

    // Default to full 12 A1-missions
    this.memoryMissions = [...a1Missions];
    return this.memoryMissions;
  }

  async loadLesson(missionId: string): Promise<LessonData | null> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('lesson_blocks')
          .select('*')
          .eq('mission_id', missionId)
          .order('order_num', { ascending: true });

        if (!error && data && data.length > 0) {
          const blocks: LessonBlock[] = data.map((b: any) => ({
            id: b.id,
            type: b.block_type,
            skills: b.skills || [],
            required: b.required ?? true,
            ...(b.content || {}),
          }));

          const mission = this.memoryMissions.find((m) => m.id === missionId);
          return {
            missionId,
            order: mission ? mission.order : 1,
            totalMissions: this.memoryMissions.length,
            title: mission ? mission.title : `Uppdrag ${missionId}`,
            blocks,
          };
        }

        console.warn(`Supabase configured but failed to load blocks for mission ${missionId}:`, error || 'No blocks returned');
        return null;
      }

      // Offline / unconfigured fallback flow:
      const stored = await AsyncStorage.getItem(LESSONS_STORAGE_KEY);
      if (stored) {
        const parsed: Record<string, LessonData> = JSON.parse(stored);
        if (parsed[missionId]) {
          return parsed[missionId];
        }
      }
    } catch (e) {
      console.warn(`Failed to load lesson for mission ${missionId}:`, e);
      if (isSupabaseConfigured()) {
        return null;
      }
    }

    if (!isSupabaseConfigured()) {
      if (this.memoryLessons[missionId]) {
        return this.memoryLessons[missionId];
      }

      if (a1Lessons[missionId]) {
        return a1Lessons[missionId];
      }
    }

    return null;
  }

  /**
   * Save missions to storage
   */
  private async persistMissions(missions: Mission[]) {
    this.memoryMissions = missions;
    await AsyncStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(missions));
  }

  /**
   * Save lessons to storage
   */
  private async persistLessons(lessons: Record<string, LessonData>) {
    this.memoryLessons = lessons;
    await AsyncStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
  }

  /**
   * Helper to extract private server-side grading key for exercises
   */
  private extractGradingKey(missionId: string, block: LessonBlock): any | null {
    const ex = (block as any).exercise;
    if (!ex) return null;

    if (block.type === 'multiple_choice' || block.type === 'listen_choice') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          correctIndex: ex.correctIndex ?? 0,
          correctOption: Array.isArray(ex.options) ? ex.options[ex.correctIndex ?? 0] : undefined,
        },
      };
    }
    if (block.type === 'fill_blank') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          correctAnswer: ex.correctAnswer || '',
        },
      };
    }
    if (block.type === 'sentence_builder') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          correctSentence: ex.correctSentence || '',
        },
      };
    }
    if (block.type === 'matching') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          pairs: ex.pairs || [],
        },
      };
    }
    if (block.type === 'free_text') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          regexPattern: ex.regexPattern || '.*',
        },
      };
    }
    if (block.type === 'speak' || block.type === 'ai_roleplay') {
      return {
        block_id: block.id,
        mission_id: missionId,
        block_type: block.type,
        correct_answer: {
          targetPhrase: ex.targetPhrase || '',
        },
      };
    }
    return null;
  }

  /**
   * Helper to sync grading key to Supabase
   */
  private async syncGradingKey(missionId: string, block: LessonBlock): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const keyData = this.extractGradingKey(missionId, block);
    if (!keyData) return;

    try {
      await supabase.from('lesson_block_grading_keys').upsert({
        block_id: keyData.block_id,
        mission_id: keyData.mission_id,
        block_type: keyData.block_type,
        correct_answer: keyData.correct_answer,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'block_id' });
    } catch (err) {
      console.warn('Failed to sync grading key to Supabase:', err);
    }
  }

  /**
   * CREATE MISSION
   */
  async createMission(missionData: Partial<Mission>): Promise<Mission> {
    const newId = String(Date.now());
    const nextOrder = this.memoryMissions.length + 1;

    const newMission: Mission = {
      id: newId,
      order: missionData.order || nextOrder,
      title: missionData.title || 'Nytt uppdrag',
      description: missionData.description || 'Beskrivning av uppdraget',
      status: 'locked',
      estimatedMinutes: missionData.estimatedMinutes || 7,
      levelCode: 'A1',
      skills: missionData.skills || ['Vokabulär'],
      route: `/learn/a1/mission/${newId}`,
      isPublished: missionData.isPublished ?? false,
      goals: missionData.goals || ['Lär dig nya ord'],
      knowledgeOutcomes: missionData.knowledgeOutcomes || ['Kan använda fraserna'],
      totalPoints: missionData.totalPoints || 50,
    };

    const updatedMissions = [...this.memoryMissions, newMission];
    await this.persistMissions(updatedMissions);

    // Create initial default lesson structure
    const initialBlocks: LessonBlock[] = [
      {
        id: `${newId}_b1_intro`,
        type: 'introduction',
        skills: ['vocabulary'],
        required: true,
        title: `Introduktion till ${newMission.title}`,
        introduction: `Välkommen till ${newMission.title}! Här lär du dig grunderna.`,
        examples: [{ phrase: 'Hej!' }, { phrase: 'Välkommen!' }],
        grammaticalNote: 'Öva varje dag för bästa resultat.',
      },
      {
        id: `${newId}_b2_summary`,
        type: 'summary',
        skills: ['reading'],
        required: true,
        title: `${newMission.title} slutfört!`,
        subtitle: 'Bra jobbat! Du har klarat uppdraget.',
        summaryPhrases: ['Grundläggande ordförråd', 'Övningar och repetition'],
      },
    ];

    const initialLesson: LessonData = {
      missionId: newId,
      order: newMission.order,
      totalMissions: updatedMissions.length,
      title: newMission.title,
      blocks: initialBlocks,
    };

    const currentLessons = { ...this.memoryLessons, [newId]: initialLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        const { error: insertMissionError } = await supabase.from('missions').insert({
          id: newId,
          level_code: 'A1',
          order_num: newMission.order,
          title: newMission.title,
          description: newMission.description,
          estimated_minutes: newMission.estimatedMinutes,
          total_points: newMission.totalPoints,
          skills: newMission.skills,
          goals: newMission.goals,
          knowledge_outcomes: newMission.knowledgeOutcomes,
          is_published: newMission.isPublished,
        });

        if (insertMissionError) {
          throw insertMissionError;
        }

        // Insert initial blocks into Supabase
        for (let i = 0; i < initialBlocks.length; i++) {
          const blk = initialBlocks[i];
          await supabase.from('lesson_blocks').insert({
            id: blk.id,
            mission_id: newId,
            order_num: i + 1,
            block_type: blk.type,
            skills: blk.skills,
            required: blk.required,
            content: blk,
          });
        }
      } catch (err: any) {
        console.error('Supabase mission insert error:', err);
        throw new Error(err.message || 'Kunde inte spara uppdraget till databasen.');
      }
    }

    return newMission;
  }

  /**
   * UPDATE MISSION
   */
  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const current = this.memoryMissions.find((m) => m.id === id);
    if (!current) throw new Error(`Uppdrag ${id} hittades inte.`);

    const updated: Mission = { ...current, ...updates };
    const updatedList = this.memoryMissions.map((m) => (m.id === id ? updated : m));
    await this.persistMissions(updatedList);

    // Also update title on lesson data if title changed
    if (updates.title && this.memoryLessons[id]) {
      this.memoryLessons[id].title = updates.title;
      await this.persistLessons(this.memoryLessons);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('missions').update({
          title: updated.title,
          description: updated.description,
          order_num: updated.order,
          estimated_minutes: updated.estimatedMinutes,
          total_points: updated.totalPoints,
          skills: updated.skills,
          goals: updated.goals,
          knowledge_outcomes: updated.knowledgeOutcomes,
          is_published: updated.isPublished,
          updated_at: new Date().toISOString(),
        }).eq('id', id);

        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.error('Supabase mission update error:', err);
        throw new Error(err.message || 'Kunde inte uppdatera uppdraget i databasen.');
      }
    }

    return updated;
  }

  /**
   * DELETE MISSION
   */
  async deleteMission(id: string): Promise<void> {
    const updated = this.memoryMissions.filter((m) => m.id !== id);
    // re-index order
    const reordered = updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    await this.persistMissions(reordered);

    const lessonsCopy = { ...this.memoryLessons };
    delete lessonsCopy[id];
    await this.persistLessons(lessonsCopy);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('missions').delete().eq('id', id);
        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.error('Supabase mission delete error:', err);
        throw new Error(err.message || 'Kunde inte radera uppdraget från databasen.');
      }
    }
  }

  /**
   * DUPLICATE MISSION
   */
  async duplicateMission(id: string): Promise<Mission> {
    const source = this.memoryMissions.find((m) => m.id === id);
    if (!source) throw new Error(`Uppdrag ${id} finns inte.`);

    const sourceLesson = await this.loadLesson(id);
    const newId = String(Date.now());
    const nextOrder = this.memoryMissions.length + 1;

    const duplicatedMission: Mission = {
      ...source,
      id: newId,
      order: nextOrder,
      title: `${source.title} (Kopia)`,
      route: `/learn/a1/mission/${newId}`,
      isPublished: false, // Created as draft
    };

    const updatedMissions = [...this.memoryMissions, duplicatedMission];
    await this.persistMissions(updatedMissions);

    let duplicatedBlocks: LessonBlock[] = [];
    if (sourceLesson && sourceLesson.blocks.length > 0) {
      duplicatedBlocks = sourceLesson.blocks.map((b, idx) => ({
        ...JSON.parse(JSON.stringify(b)),
        id: `${newId}_b${idx + 1}_${b.type}`,
      }));

      const newLesson: LessonData = {
        missionId: newId,
        order: nextOrder,
        totalMissions: updatedMissions.length,
        title: duplicatedMission.title,
        blocks: duplicatedBlocks,
      };

      const updatedLessons = { ...this.memoryLessons, [newId]: newLesson };
      await this.persistLessons(updatedLessons);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error: missionErr } = await supabase.from('missions').insert({
          id: newId,
          level_code: 'A1',
          order_num: duplicatedMission.order,
          title: duplicatedMission.title,
          description: duplicatedMission.description,
          estimated_minutes: duplicatedMission.estimatedMinutes,
          total_points: duplicatedMission.totalPoints,
          skills: duplicatedMission.skills,
          goals: duplicatedMission.goals,
          knowledge_outcomes: duplicatedMission.knowledgeOutcomes,
          is_published: duplicatedMission.isPublished,
        });

        if (missionErr) throw missionErr;

        for (let i = 0; i < duplicatedBlocks.length; i++) {
          const b = duplicatedBlocks[i];
          await supabase.from('lesson_blocks').insert({
            id: b.id,
            mission_id: newId,
            order_num: i + 1,
            block_type: b.type,
            skills: b.skills,
            required: b.required,
            content: b,
          });

          await this.syncGradingKey(newId, b);
        }
      } catch (err: any) {
        console.error('Supabase duplicate mission error:', err);
        throw new Error(err.message || 'Kunde inte duplicera uppdraget i databasen.');
      }
    }

    return duplicatedMission;
  }

  /**
   * REORDER MISSIONS
   */
  async reorderMissions(orderedIds: string[]): Promise<Mission[]> {
    const reordered: Mission[] = [];
    orderedIds.forEach((id, index) => {
      const found = this.memoryMissions.find((m) => m.id === id);
      if (found) {
        reordered.push({ ...found, order: index + 1 });
      }
    });

    await this.persistMissions(reordered);

    if (isSupabaseConfigured()) {
      try {
        await Promise.all(
          reordered.map((m) =>
            supabase.from('missions').update({ order_num: m.order, updated_at: new Date().toISOString() }).eq('id', m.id)
          )
        );
      } catch (err) {
        console.warn('Supabase reorder missions error:', err);
      }
    }

    return reordered;
  }

  /**
   * TOGGLE PUBLISH
   */
  async togglePublish(id: string, isPublished: boolean): Promise<Mission> {
    return this.updateMission(id, { isPublished });
  }

  /**
   * BLOCK OPERATIONS
   */
  async addBlock(missionId: string, block: LessonBlock): Promise<LessonData> {
    let lesson = await this.loadLesson(missionId);
    if (!lesson) {
      const m = this.memoryMissions.find((item) => item.id === missionId);
      lesson = {
        missionId,
        order: m ? m.order : 1,
        totalMissions: this.memoryMissions.length,
        title: m ? m.title : `Uppdrag ${missionId}`,
        blocks: [],
      };
    }

    // Rules:
    // 1. Introduction should be first
    // 2. Summary should be last
    // 3. New exercises/content are inserted immediately before summary (if summary exists)
    const summaryIndex = lesson.blocks.findIndex((b) => b.type === 'summary');
    let updatedBlocks: LessonBlock[];
    let targetIndex = lesson.blocks.length;

    if (block.type === 'introduction') {
      updatedBlocks = [block, ...lesson.blocks];
      targetIndex = 0;
    } else if (summaryIndex !== -1 && block.type !== 'summary') {
      updatedBlocks = [...lesson.blocks];
      updatedBlocks.splice(summaryIndex, 0, block);
      targetIndex = summaryIndex;
    } else {
      updatedBlocks = [...lesson.blocks, block];
      targetIndex = updatedBlocks.length - 1;
    }

    const updatedLesson: LessonData = { ...lesson, blocks: updatedBlocks };

    const currentLessons = { ...this.memoryLessons, [missionId]: updatedLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('lesson_blocks').insert({
          id: block.id,
          mission_id: missionId,
          order_num: targetIndex + 1,
          block_type: block.type,
          skills: block.skills,
          required: block.required,
          content: block,
        });

        if (error) throw error;

        // If block was inserted before existing blocks, re-sync order_num
        if (targetIndex < updatedBlocks.length - 1) {
          await Promise.all(
            updatedBlocks.map((b, idx) =>
              supabase
                .from('lesson_blocks')
                .update({ order_num: idx + 1, updated_at: new Date().toISOString() })
                .eq('id', b.id)
            )
          );
        }

        await this.syncGradingKey(missionId, block);
      } catch (err: any) {
        console.error('Supabase block insert error:', err);
        throw new Error(err.message || 'Kunde inte lägga till lektionsblocket i databasen.');
      }
    }

    return updatedLesson;
  }

  async updateBlock(missionId: string, blockId: string, updatedBlock: LessonBlock): Promise<LessonData> {
    const lesson = await this.loadLesson(missionId);
    if (!lesson) throw new Error(`Lektion för uppdrag ${missionId} saknas.`);

    const updatedBlocks = lesson.blocks.map((b) => (b.id === blockId ? updatedBlock : b));
    const updatedLesson: LessonData = { ...lesson, blocks: updatedBlocks };

    const currentLessons = { ...this.memoryLessons, [missionId]: updatedLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('lesson_blocks').update({
          block_type: updatedBlock.type,
          skills: updatedBlock.skills,
          required: updatedBlock.required,
          content: updatedBlock,
          updated_at: new Date().toISOString(),
        }).eq('id', blockId);

        if (error) throw error;

        await this.syncGradingKey(missionId, updatedBlock);
      } catch (err: any) {
        console.error('Supabase block update error:', err);
        throw new Error(err.message || 'Kunde inte uppdatera lektionsblocket i databasen.');
      }
    }

    return updatedLesson;
  }

  async deleteBlock(missionId: string, blockId: string): Promise<LessonData> {
    const lesson = await this.loadLesson(missionId);
    if (!lesson) throw new Error(`Lektion för uppdrag ${missionId} saknas.`);

    const updatedBlocks = lesson.blocks.filter((b) => b.id !== blockId);
    const updatedLesson: LessonData = { ...lesson, blocks: updatedBlocks };

    const currentLessons = { ...this.memoryLessons, [missionId]: updatedLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('lesson_blocks').delete().eq('id', blockId);
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase block delete error:', err);
        throw new Error(err.message || 'Kunde inte radera lektionsblocket från databasen.');
      }
    }

    return updatedLesson;
  }

  async duplicateBlock(missionId: string, blockId: string): Promise<LessonData> {
    const lesson = await this.loadLesson(missionId);
    if (!lesson) throw new Error(`Lektion för uppdrag ${missionId} saknas.`);

    const targetIndex = lesson.blocks.findIndex((b) => b.id === blockId);
    if (targetIndex === -1) throw new Error(`Block ${blockId} hittades inte.`);

    const source = lesson.blocks[targetIndex];
    const newBlockId = `${missionId}_b${Date.now()}_${source.type}`;
    const duplicate: LessonBlock = {
      ...JSON.parse(JSON.stringify(source)),
      id: newBlockId,
    };

    const newBlocks = [...lesson.blocks];
    newBlocks.splice(targetIndex + 1, 0, duplicate);

    const updatedLesson: LessonData = { ...lesson, blocks: newBlocks };
    const currentLessons = { ...this.memoryLessons, [missionId]: updatedLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('lesson_blocks').insert({
          id: duplicate.id,
          mission_id: missionId,
          order_num: targetIndex + 2,
          block_type: duplicate.type,
          skills: duplicate.skills,
          required: duplicate.required,
          content: duplicate,
        });

        if (error) throw error;

        await this.syncGradingKey(missionId, duplicate);
      } catch (err: any) {
        console.error('Supabase duplicate block error:', err);
        throw new Error(err.message || 'Kunde inte duplicera lektionsblocket i databasen.');
      }
    }

    return updatedLesson;
  }

  async reorderBlocks(missionId: string, blockIds: string[]): Promise<LessonData> {
    const lesson = await this.loadLesson(missionId);
    if (!lesson) throw new Error(`Lektion för uppdrag ${missionId} saknas.`);

    const reordered: LessonBlock[] = [];
    blockIds.forEach((id) => {
      const found = lesson.blocks.find((b) => b.id === id);
      if (found) reordered.push(found);
    });

    const updatedLesson: LessonData = { ...lesson, blocks: reordered };
    const currentLessons = { ...this.memoryLessons, [missionId]: updatedLesson };
    await this.persistLessons(currentLessons);

    if (isSupabaseConfigured()) {
      try {
        await Promise.all(
          reordered.map((b, idx) =>
            supabase.from('lesson_blocks').update({
              order_num: idx + 1,
              updated_at: new Date().toISOString(),
            }).eq('id', b.id)
          )
        );
      } catch (err) {
        console.warn('Supabase reorder blocks error:', err);
      }
    }

    return updatedLesson;
  }

  /**
   * STUDENT ANALYTICS
   * Fetches real registered students from Supabase (excluding admins and deleted accounts).
   * Never returns mock or hardcoded student records.
   */
  async getStudentAnalytics(): Promise<StudentProgressSummary[]> {
    if (isSupabaseConfigured()) {
      // Attempt 1: Call secure admin RPC
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_student_analytics');

        if (!rpcError && Array.isArray(rpcData)) {
          return rpcData.map((row: any) => ({
            userId: String(row.user_id),
            fullName: row.full_name || 'Elev',
            email: row.email || '',
            completedMissionsCount: Number(row.completed_missions_count || 0),
            totalPoints: Number(row.total_points || 0),
            currentStreak: Number(row.current_streak || 1),
            lastActive: row.last_active ? new Date(row.last_active).toLocaleDateString('sv-SE', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Nyligen',
            level: row.level || 'A1',
          }));
        }
      } catch (rpcErr) {
        console.warn('RPC admin_get_student_analytics unavailable, falling back to direct table queries:', rpcErr);
      }

      // Attempt 2: Direct filtered table queries (Strictly role = 'student')
      try {
        const { data: roleRows, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'student');

        if (roleError) {
          throw roleError;
        }

        if (!roleRows || roleRows.length === 0) {
          return [];
        }

        const studentIds = roleRows.map((r: any) => r.user_id);

        const [profilesRes, progRes, attemptsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, updated_at, created_at').in('id', studentIds),
          supabase.from('user_progression').select('user_id, points, current_streak, unlocked_level, last_active_at').in('user_id', studentIds),
          supabase.from('mission_attempts').select('user_id, mission_id, is_completed').in('user_id', studentIds).eq('is_completed', true),
        ]);

        const profilesMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
        const progMap = new Map((progRes.data || []).map((p: any) => [p.user_id, p]));
        
        // Group completed missions per student
        const completedCountMap = new Map<string, number>();
        (attemptsRes.data || []).forEach((a: any) => {
          completedCountMap.set(a.user_id, (completedCountMap.get(a.user_id) || 0) + 1);
        });

        return studentIds.map((uid: string) => {
          const prof = profilesMap.get(uid);
          const prog = progMap.get(uid);
          const completedCount = completedCountMap.get(uid) || 0;
          const lastActiveIso = prog?.last_active_at || prof?.updated_at || prof?.created_at;

          return {
            userId: uid,
            fullName: prof?.full_name || prof?.email?.split('@')[0] || 'Elev',
            email: prof?.email || '',
            completedMissionsCount: completedCount,
            totalPoints: Number(prog?.points || 0),
            currentStreak: Number(prog?.current_streak || 1),
            lastActive: lastActiveIso ? new Date(lastActiveIso).toLocaleDateString('sv-SE', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Nyligen',
            level: prog?.unlocked_level || 'A1',
          };
        });
      } catch (err) {
        console.error('Failed to load registered students from database:', err);
        throw new Error('Kunde inte läsa in elevstatistik från databasen.');
      }
    }

    // When Supabase is not configured (e.g. offline/initial state), return empty array
    return [];
  }
}

export const courseService = new CourseService();
