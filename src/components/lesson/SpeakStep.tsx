import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme/theme';
import { SpeakBlock, SpeakBlockState } from '../../types/lesson';
import Button from '../Button';
import Icon from '../Icon';
import { AudioPlayer } from '../AudioPlayer';
import { evaluateSpeechAccuracy, SpeechEvaluationResult } from '../../utils/speechEvaluation';

interface SpeakStepProps {
  block: SpeakBlock;
  state: SpeakBlockState | undefined;
  onStateChange: (state: SpeakBlockState) => void;
  onNext: () => void;
}

export const SpeakStep: React.FC<SpeakStepProps> = ({
  block,
  state,
  onStateChange,
  onNext,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(state?.hasSpoken ?? false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>(state?.transcript ?? '');
  const [evaluation, setEvaluation] = useState<SpeechEvaluationResult | null>(
    state?.evaluationStatus
      ? {
          status: state.evaluationStatus,
          score: state.score ?? (state.isCorrect ? 100 : 40),
          feedbackTitle: state.isCorrect ? 'Rätt!' : 'Försök igen',
          feedbackMessage: state.speechFeedback || '',
          recognizedText: state.transcript || '',
          targetPhrase: block.exercise.targetPhrase,
        }
      : null
  );
  const [isChecked, setIsChecked] = useState(state?.isChecked ?? false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const handleStartSpeaking = async () => {
    setPermissionError(null);
    setTranscript('');
    setEvaluation(null);

    // 1. Web Speech Recognition API if available in browser
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))
    ) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = 'sv-SE';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        setIsRecording(true);

        recognition.onresult = (event: any) => {
          setIsRecording(false);
          setHasRecorded(true);
          const speechResult = event.results?.[0]?.[0]?.transcript || '';
          setTranscript(speechResult);

          const result = evaluateSpeechAccuracy(speechResult, block.exercise.targetPhrase);
          setEvaluation(result);
        };

        recognition.onerror = (event: any) => {
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setPermissionError(
              'Mikrofonåtkomst nekades i webbläsaren. Aktivera mikrofonen i adressfältet eller öva muntligt högt.'
            );
            setEvaluation({
              status: 'permission_denied',
              score: 0,
              feedbackTitle: 'Mikrofon nekades',
              feedbackMessage:
                'Mikrofonåtkomst nekades. Aktivera mikrofonen i webbläsarens inställningar för att prova igen.',
              recognizedText: '',
              targetPhrase: block.exercise.targetPhrase,
            });
            setHasRecorded(true);
          } else if (event.error === 'no-speech') {
            setEvaluation({
              status: 'empty',
              score: 0,
              feedbackTitle: 'Inget tal uppfattades',
              feedbackMessage: 'Mikrofonen hörde inget tal. Försök att tala lite högre och tydligare.',
              recognizedText: '',
              targetPhrase: block.exercise.targetPhrase,
            });
            setHasRecorded(true);
          } else {
            // Fall back to standard audio stream
            handleFallbackAudioRecord();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition start failed, falling back to MediaStream:', e);
      }
    }

    // 2. Fallback using navigator.mediaDevices if Web Speech Recognition is not available
    handleFallbackAudioRecord();
  };

  const handleFallbackAudioRecord = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Record for 3.5 seconds
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          setHasRecorded(true);
          // Transparent status: audio recorded without speech-to-text recognition
          setEvaluation({
            status: 'recorded_unverified',
            score: undefined,
            feedbackTitle: 'Inspelning sparad',
            feedbackMessage:
              'Inspelningen är klar, men uttalet kunde inte bedömas automatiskt på den här enheten.\n\nLyssna på modelluttalet och jämför själv, eller försök i en webbläsare med taligenkänning.',
            recognizedText: '',
            targetPhrase: block.exercise.targetPhrase,
          });
        }, 3500);
      } catch (err: any) {
        setIsRecording(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError(
            'Mikrofonåtkomst nekades i webbläsaren. Aktivera mikrofonen i adressfältet eller öva muntligt på egen hand.'
          );
        } else {
          setPermissionError('Kunde inte nå mikrofonen på denna enhet. Träna gärna muntligt högt!');
        }
      }
    } else {
      // Native / simulated audio recording
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasRecorded(true);
        setEvaluation({
          status: 'recorded_unverified',
          score: undefined,
          feedbackTitle: 'Inspelning sparad',
          feedbackMessage:
            'Inspelningen är klar, men uttalet kunde inte bedömas automatiskt på den här enheten.\n\nLyssna på modelluttalet och jämför själv, eller försök i en webbläsare med taligenkänning.',
          recognizedText: '',
          targetPhrase: block.exercise.targetPhrase,
        });
      }, 2500);
    }
  };

  const handleCheck = () => {
    if (!evaluation && !hasRecorded) return;

    // Never award automated correct/pass on unverified recording
    const isPass =
      evaluation?.status === 'correct' || evaluation?.status === 'almost';
    setIsChecked(true);

    onStateChange({
      type: 'speak',
      recorded: true,
      hasSpoken: true,
      isChecked: true,
      isCorrect: isPass,
      transcript: transcript || evaluation?.recognizedText,
      score: evaluation?.score,
      speechFeedback: evaluation?.feedbackMessage,
      evaluationStatus: evaluation?.status,
    });
  };

  const handleRetry = () => {
    setIsChecked(false);
    setHasRecorded(false);
    setTranscript('');
    setEvaluation(null);
    setPermissionError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{block.exercise.instruction}</Text>

      {/* TARGET PHRASE CARD */}
      <View style={styles.phraseCard}>
        <Text style={styles.targetPhrase}>{block.exercise.targetPhrase}</Text>
        {block.exercise.translation && (
          <Text style={styles.translationText}>{block.exercise.translation}</Text>
        )}
        {block.exercise.phoneticHint && (
          <View style={styles.phoneticContainer}>
            <Text style={styles.phoneticLabel}>Uttal & stavelseindelning:</Text>
            <Text style={styles.phoneticHint}>{block.exercise.phoneticHint}</Text>
          </View>
        )}

        <View style={styles.audioWrapper}>
          <AudioPlayer
            text={block.exercise.targetPhrase}
            audioUrl={block.exercise.audioUrl}
            label="Lyssna på modelluttalet"
          />
        </View>
      </View>

      {/* NOTICE: SPEECH EVALUATION SCOPE */}
      <View style={styles.noticeBox}>
        <Icon name="information-circle-outline" size={16} color="#64748B" />
        <Text style={styles.noticeText}>
          Tal-till-text kontrollerar vad systemet uppfattade av orden. Jämför gärna ditt uttal med modelluttalet för språkmelodi och betoning.
        </Text>
      </View>

      {/* MIC SECTION */}
      <View style={styles.micSection}>
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording && styles.micButtonRecording,
            hasRecorded && (evaluation?.status === 'correct' || evaluation?.status === 'almost') && styles.micButtonCorrect,
            hasRecorded && evaluation?.status === 'recorded_unverified' && styles.micButtonNeutral,
            hasRecorded && (evaluation?.status === 'incorrect' || evaluation?.status === 'empty') && styles.micButtonIncorrect,
          ]}
          onPress={handleStartSpeaking}
          disabled={isRecording || isChecked}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Spelar in...' : 'Tryck för att prata'}
        >
          {isRecording ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Icon
              name={
                hasRecorded
                  ? evaluation?.status === 'incorrect'
                    ? 'refresh-outline'
                    : evaluation?.status === 'recorded_unverified'
                    ? 'checkmark'
                    : 'checkmark'
                  : 'mic'
              }
              size={32}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
        <Text style={styles.micStatusText}>
          {isRecording
            ? 'Lyssnar... säg frasen nu!'
            : hasRecorded
            ? 'Inspelning genomförd'
            : 'Tryck på mikrofonen och säg frasen på svenska'}
        </Text>
      </View>

      {/* TRANSCRIPT DISPLAY */}
      {transcript ? (
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptLabel}>Uppfattat tal:</Text>
          <Text style={styles.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      {/* EVALUATION FEEDBACK */}
      {evaluation && (
        <View
          style={[
            styles.feedbackBox,
            evaluation.status === 'correct' && styles.feedbackBoxCorrect,
            evaluation.status === 'almost' && styles.feedbackBoxAlmost,
            evaluation.status === 'recorded_unverified' && styles.feedbackBoxNeutral,
            (evaluation.status === 'incorrect' ||
              evaluation.status === 'empty' ||
              evaluation.status === 'permission_denied') &&
              styles.feedbackBoxIncorrect,
          ]}
        >
          <View style={styles.feedbackHeaderRow}>
            <Icon
              name={
                evaluation.status === 'correct'
                  ? 'checkmark-circle'
                  : evaluation.status === 'almost'
                  ? 'information-circle-outline'
                  : evaluation.status === 'recorded_unverified'
                  ? 'information-circle-outline'
                  : 'alert-circle'
              }
              size={20}
              color={
                evaluation.status === 'correct'
                  ? '#047857'
                  : evaluation.status === 'almost'
                  ? '#D97706'
                  : evaluation.status === 'recorded_unverified'
                  ? '#3B82F6'
                  : '#B91C1C'
              }
            />
            <Text
              style={[
                styles.feedbackTitle,
                evaluation.status === 'correct' && styles.feedbackTitleCorrect,
                evaluation.status === 'almost' && styles.feedbackTitleAlmost,
                evaluation.status === 'recorded_unverified' && styles.feedbackTitleNeutral,
                (evaluation.status === 'incorrect' ||
                  evaluation.status === 'empty' ||
                  evaluation.status === 'permission_denied') &&
                  styles.feedbackTitleIncorrect,
              ]}
            >
              {evaluation.feedbackTitle}
            </Text>
          </View>
          <Text style={styles.feedbackBodyText}>{evaluation.feedbackMessage}</Text>
        </View>
      )}

      {permissionError && (
        <View style={styles.permissionBox}>
          <Icon name="information-circle-outline" size={20} color="#92400E" />
          <Text style={styles.permissionText}>{permissionError}</Text>
        </View>
      )}

      {block.exercise.tips && (
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Uttalstips:</Text>
          <Text style={styles.tipsText}>{block.exercise.tips}</Text>
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.buttonContainer}>
        {!isChecked ? (
          <Button
            title={
              evaluation?.status === 'recorded_unverified'
                ? 'Fortsätt efter egen jämförelse'
                : 'Kontrollera uttalet'
            }
            onPress={handleCheck}
            disabled={!hasRecorded && !permissionError}
            variant="primary"
          />
        ) : (
          <View style={{ gap: theme.spacing.xs, width: '100%' }}>
            <Button
              title={
                evaluation?.status === 'recorded_unverified'
                  ? 'Fortsätt till nästa steg'
                  : 'Fortsätt'
              }
              onPress={onNext}
              variant="primary"
            />
            <Button
              title="Spela in igen"
              onPress={handleRetry}
              variant="secondary"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  instruction: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: 28,
  },
  phraseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  targetPhrase: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  translationText: {
    fontSize: 15,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  phoneticContainer: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    alignItems: 'center',
  },
  phoneticLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  phoneticHint: {
    fontSize: 14,
    color: '#1E4E8C',
    fontWeight: '600',
    textAlign: 'center',
  },
  audioWrapper: {
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
  },
  micSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E4E8C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E4E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  micButtonRecording: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 1.05 }],
  },
  micButtonCorrect: {
    backgroundColor: '#059669',
  },
  micButtonNeutral: {
    backgroundColor: '#475569',
  },
  micButtonIncorrect: {
    backgroundColor: '#E11D48',
  },
  micStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  noticeText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  transcriptCard: {
    backgroundColor: '#F1F5F9',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: theme.spacing.md,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  feedbackBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  feedbackBoxCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  feedbackBoxAlmost: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  feedbackBoxNeutral: {
    backgroundColor: '#F1F5F9',
    borderColor: '#94A3B8',
  },
  feedbackBoxIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  feedbackTitleCorrect: {
    color: '#047857',
  },
  feedbackTitleAlmost: {
    color: '#B45309',
  },
  feedbackTitleNeutral: {
    color: '#334155',
  },
  feedbackTitleIncorrect: {
    color: '#B91C1C',
  },
  feedbackBodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  permissionText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: '#F8FAFC',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: theme.spacing.sm,
    width: '100%',
  },
});
