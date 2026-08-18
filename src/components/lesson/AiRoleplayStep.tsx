import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { theme } from "../../theme/theme";
import {
  AiRoleplayBlock,
  AiRoleplayBlockState,
  AiRoleplayMessage,
  AiRoleplayFeedback,
} from "../../types/lesson";
import Button from "../Button";
import Icon from "../Icon";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";

interface AiRoleplayStepProps {
  block: AiRoleplayBlock;
  state: AiRoleplayBlockState | undefined;
  onStateChange: (state: AiRoleplayBlockState) => void;
  onNext: () => void;
}

export const AiRoleplayStep: React.FC<AiRoleplayStepProps> = ({
  block,
  state,
  onStateChange,
  onNext,
}) => {
  const { width } = useWindowDimensions();
  const { user, isAdmin } = useAuth();
  const isCompact = width < 400;
  const scrollViewRef = useRef<ScrollView>(null);

  const maxTurns = block.exercise.maxTurns || 8;

  const initialMessages: AiRoleplayMessage[] =
    state?.messages && state.messages.length > 0
      ? state.messages
      : [
          {
            id: "msg_initial_0",
            sender: "ai",
            text:
              block.exercise.initialMessage ||
              "Hej och välkommen! Vad får det lov att vara?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];

  const [messages, setMessages] =
    useState<AiRoleplayMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hint, setHint] = useState<string | undefined>(
    block.exercise.suggestedPhrases?.[0] || undefined,
  );
  const [goalAccomplished, setGoalAccomplished] = useState(
    state?.completedGoal ?? false,
  );
  const [isChecked, setIsChecked] = useState(state?.isChecked ?? false);
  const [feedback, setFeedback] = useState<AiRoleplayFeedback | undefined>(
    state?.feedback,
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    state?.isDemo ?? Boolean(user?.isDemo),
  );
  const [failedLastInput, setFailedLastInput] = useState<string | null>(null);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleRunDiagnostic = async () => {
    setIsDiagnosing(true);
    setDiagResult(null);
    try {
      const res = await aiService.diagnoseRoleplay();
      setDiagResult(res);
    } catch (err: any) {
      setDiagResult({
        status: "error",
        rootCause: `Kunde inte köra diagnostik: ${err?.message}`,
        totalDurationMs: 0,
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const userTurnCount = messages.filter((m) => m.sender === "user").length;
  const isTurnLimitReached = userTurnCount >= maxTurns;
  const isConversationFinished =
    goalAccomplished || isTurnLimitReached || isChecked;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, isLoading, isConversationFinished]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading || isConversationFinished) return;

    setErrorMessage(null);
    setFailedLastInput(null);

    const userMsg: AiRoleplayMessage = {
      id: `msg_u_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const cleanMissionId = (block.id.split("_")[0] || "1").replace(/^u/i, "");
      const response = await aiService.getRoleplayResponse({
        missionId: cleanMissionId,
        blockId: block.id,
        characterName: block.exercise.characterName || "Emma",
        characterRole: block.exercise.characterRole || "Samtalspartner",
        userRole: block.exercise.userRole || "Kund",
        languageLevel: block.exercise.languageLevel || "A1",
        scenario: block.exercise.scenario,
        userMessage: text,
        conversationHistory: newMessages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        goalDescription:
          block.exercise.learningGoal || block.exercise.goalDescription,
        allowedTopics: block.exercise.allowedTopics || ["vardag"],
        suggestedPhrases: block.exercise.suggestedPhrases || [],
        maxTurns,
        generateFeedback: block.exercise.showFeedback !== false,
        isDemoMode: Boolean(user?.isDemo),
      });

      if (response.isDemo) {
        setIsDemoMode(true);
      }

      if (response.error) {
        setErrorMessage(response.error);
        setFailedLastInput(text);
        // Rollback optimistic message so student can retry cleanly
        setMessages(messages);
        setInputText(text);
        setIsLoading(false);
        return;
      }

      const replyText = response.aiReply || "Tack för ditt svar!";
      const aiMsg: AiRoleplayMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      if (response.hintForNextTurn) {
        setHint(response.hintForNextTurn);
      }

      const accomplished =
        response.goalAccomplished ||
        newMessages.filter((m) => m.sender === "user").length >= maxTurns;
      if (accomplished) {
        setGoalAccomplished(true);
      }

      if (response.feedback) {
        setFeedback(response.feedback);
      }

      onStateChange({
        type: "ai_roleplay",
        messages: finalMessages,
        completedGoal: accomplished || goalAccomplished,
        isChecked: false,
        turnsCount:
          response.turnsCount ??
          newMessages.filter((m) => m.sender === "user").length,
        feedback: response.feedback || feedback,
        isDemo: response.isDemo,
      });
    } catch (err: any) {
      console.warn("Roleplay turn error:", err);
      setErrorMessage(
        "Kunde inte ansluta till AI-rollspelet. Kontrollera nätverket och försök igen.",
      );
      setFailedLastInput(text);
      setMessages(messages);
      setInputText(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcludeEarly = async () => {
    if (isLoading || isChecked) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const cleanMissionId = (block.id.split("_")[0] || "1").replace(/^u/i, "");
      const response = await aiService.getRoleplayResponse({
        missionId: cleanMissionId,
        blockId: block.id,
        characterName: block.exercise.characterName || "Emma",
        characterRole: block.exercise.characterRole || "Samtalspartner",
        userRole: block.exercise.userRole || "Kund",
        languageLevel: block.exercise.languageLevel || "A1",
        scenario: block.exercise.scenario,
        userMessage: "Tack så mycket! Hej då!",
        conversationHistory: messages.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        goalDescription:
          block.exercise.learningGoal || block.exercise.goalDescription,
        allowedTopics: block.exercise.allowedTopics || ["vardag"],
        suggestedPhrases: block.exercise.suggestedPhrases || [],
        maxTurns,
        generateFeedback: true,
        isDemoMode: Boolean(user?.isDemo),
      });

      const aiMsg: AiRoleplayMessage = {
        id: `msg_ai_conclude_${Date.now()}`,
        sender: "ai",
        text: response.aiReply || "Tack för ett bra samtal! Bra kämpat.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const finalMessages = [...messages, aiMsg];
      setMessages(finalMessages);
      setGoalAccomplished(true);
      if (response.feedback) {
        setFeedback(response.feedback);
      }

      onStateChange({
        type: "ai_roleplay",
        messages: finalMessages,
        completedGoal: true,
        isChecked: false,
        turnsCount: userTurnCount + 1,
        feedback: response.feedback || feedback,
        isDemo: response.isDemo,
      });
    } catch {
      setGoalAccomplished(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setIsChecked(true);
    onStateChange({
      type: "ai_roleplay",
      messages,
      completedGoal: true,
      isChecked: true,
      turnsCount: userTurnCount,
      feedback,
      isDemo: isDemoMode,
    });
  };

  const showFeedbackCard =
    block.exercise.showFeedback !== false &&
    feedback &&
    (goalAccomplished || isTurnLimitReached);

  return (
    <View style={styles.container}>
      {/* Explicit Demo Mode Banner */}
      {isDemoMode && (
        <View style={styles.demoModeBanner}>
          <Icon name="information-circle-outline" size={16} color="#B45309" />
          <Text style={styles.demoModeText}>
            AI-demoläge – inget riktigt AI-anrop genomförs
          </Text>
        </View>
      )}

      {/* Header scenario banner */}
      <View style={styles.scenarioCard}>
        <View style={styles.scenarioHeaderRow}>
          <View style={styles.titleBadgeRow}>
            <View style={styles.aiBadge}>
              <Icon name="chatbubbles-outline" size={16} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI-Rollspel</Text>
            </View>
            <Text style={styles.scenarioTitle}>
              {block.exercise.title || "Rollspelsdialog"}
            </Text>
          </View>

          <View style={styles.turnBadge}>
            <Text style={styles.turnBadgeText}>
              Svar {userTurnCount} / {maxTurns}
            </Text>
          </View>
        </View>

        {/* Roles information */}
        <View style={styles.rolesRow}>
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>AI:</Text>
            <Text style={styles.roleValue} numberOfLines={1}>
              {block.exercise.characterName || "Samtalspartner"} (
              {block.exercise.characterRole || "Personal"})
            </Text>
          </View>
          <View style={styles.roleDivider} />
          <View style={styles.roleItem}>
            <Text style={styles.roleLabel}>Du:</Text>
            <Text style={styles.roleValue} numberOfLines={1}>
              {block.exercise.userRole || "Kund / Elev"}
            </Text>
          </View>
        </View>

        {/* Instruction and goal */}
        {Boolean(block.exercise.instruction) && (
          <Text style={styles.instructionText}>
            {block.exercise.instruction}
          </Text>
        )}
        <View style={styles.goalRow}>
          <Icon name="flag-outline" size={14} color="#1E4E8C" />
          <Text style={styles.goalText}>
            Mål:{" "}
            {block.exercise.learningGoal ||
              block.exercise.goalDescription ||
              "Ha en kort dialog på svenska."}
          </Text>
        </View>
      </View>

      {/* Messages conversation view */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubbleWrapper,
                isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <View style={styles.bubbleHeader}>
                  <Text
                    style={[
                      styles.senderLabel,
                      isUser ? styles.userSenderLabel : styles.aiSenderLabel,
                    ]}
                  >
                    {isUser
                      ? block.exercise.userRole || "Du"
                      : block.exercise.characterName || "AI"}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      isUser ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}

        {isLoading && (
          <View style={[styles.messageBubbleWrapper, styles.aiBubbleWrapper]}>
            <View
              style={[
                styles.messageBubble,
                styles.aiBubble,
                styles.loadingBubble,
              ]}
            >
              <ActivityIndicator size="small" color="#1E4E8C" />
              <Text style={styles.loadingText}>
                {block.exercise.characterName || "AI"} skriver ett svar...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Error alert banner with retry action */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={18} color="#DC2626" />
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              {failedLastInput && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => handleSendMessage(failedLastInput)}
                  disabled={isLoading}
                >
                  <Text style={styles.retryButtonText}>Försök igen</Text>
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: "#475569" }]}
                  onPress={handleRunDiagnostic}
                  disabled={isDiagnosing}
                >
                  <Text style={styles.retryButtonText}>
                    {isDiagnosing ? "Kör diagnostik..." : "Kör AI-diagnostik"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Admin Diagnostic Result Card */}
      {diagResult && (
        <View style={styles.diagCard}>
          <View style={styles.diagHeader}>
            <Icon
              name={
                diagResult.status === "success"
                  ? "checkmark-circle"
                  : "alert-circle"
              }
              size={18}
              color={diagResult.status === "success" ? "#059669" : "#DC2626"}
            />
            <Text style={styles.diagTitle}>
              AI-Diagnostikresultat ({diagResult.totalDurationMs} ms)
            </Text>
          </View>
          <Text style={styles.diagText}>
            <Text style={{ fontWeight: "700" }}>Rotorsak: </Text>
            {diagResult.rootCause}
          </Text>
          {diagResult.workingModel && (
            <Text style={styles.diagText}>
              <Text style={{ fontWeight: "700" }}>Aktiv modell: </Text>
              {diagResult.workingModel}
            </Text>
          )}
          <Text style={styles.diagText}>
            <Text style={{ fontWeight: "700" }}>API-nyckel: </Text>
            {diagResult.keyValid ? "Giltig ✅" : "Ogiltig ❌"} |{" "}
            <Text style={{ fontWeight: "700" }}>Kvot: </Text>
            {diagResult.quotaOk ? "OK ✅" : "Överskriden (429) ❌"}
          </Text>
        </View>
      )}

      {/* Hint & Suggested Phrases section when active */}
      {!isConversationFinished &&
        block.exercise.suggestedPhrases &&
        block.exercise.suggestedPhrases.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeaderRow}>
              <Icon
                name="information-circle-outline"
                size={14}
                color="#D97706"
              />
              <Text style={styles.suggestionsHeader}>
                {hint ? `Tips: "${hint}"` : "Föreslagna fraser:"}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedChipsRow}
            >
              {block.exercise.suggestedPhrases.map((phrase, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleSendMessage(phrase)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionChipText}>{phrase}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      {/* Structured Pedagogical Feedback Card */}
      {showFeedbackCard && (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Icon name="checkmark-circle-outline" size={20} color="#059669" />
            <Text style={styles.feedbackTitle}>Återkoppling på samtalet</Text>
          </View>

          {Boolean(feedback.strengths) && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackSectionTitle}>
                Vad du gjorde bra:
              </Text>
              <Text style={styles.feedbackSectionText}>
                {feedback.strengths}
              </Text>
            </View>
          )}

          {Boolean(feedback.correction) && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackSectionTitle}>Språktips:</Text>
              <Text style={styles.feedbackSectionText}>
                {feedback.correction}
              </Text>
            </View>
          )}

          {Boolean(feedback.improvedExample) && (
            <View style={styles.feedbackExampleBox}>
              <Text style={styles.feedbackExampleLabel}>
                Förbättrat exempel:
              </Text>
              <Text style={styles.feedbackExampleText}>
                "{feedback.improvedExample}"
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Goal accomplished banner */}
      {isConversationFinished && !showFeedbackCard && (
        <View style={styles.goalSuccessCard}>
          <Icon name="checkmark-circle" size={20} color="#059669" />
          <Text style={styles.goalSuccessText}>
            {isTurnLimitReached
              ? "Bra jobbat! Du har genomfört alla turer i dialogen."
              : "Målet för samtalet är uppnått! Mycket bra."}
          </Text>
        </View>
      )}

      {/* Bottom controls: input or completion buttons */}
      {!isConversationFinished ? (
        <View style={styles.footerSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Skriv ditt svar på svenska..."
              placeholderTextColor="#94A3B8"
              editable={!isLoading}
              maxLength={300}
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Icon name="paper-plane" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Action to conclude dialogue early */}
          {userTurnCount >= 2 && (
            <TouchableOpacity
              style={styles.concludeEarlyBtn}
              onPress={handleConcludeEarly}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.concludeEarlyText}>Avsluta samtalet nu</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          {!isChecked ? (
            <Button
              title="Slutför och gå vidare"
              onPress={handleFinish}
              variant="primary"
            />
          ) : (
            <Button title="Nästa steg" onPress={onNext} variant="primary" />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    flex: 1,
  },
  demoModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    gap: 6,
  },
  demoModeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
    flex: 1,
  },
  scenarioCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  scenarioHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E4E8C",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  turnBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  turnBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E4E8C",
  },
  rolesRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  roleValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    flexShrink: 1,
  },
  roleDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  instructionText: {
    fontSize: 12,
    color: "#334155",
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  goalText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E4E8C",
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    minHeight: 220,
    maxHeight: 340,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messagesContent: {
    gap: 10,
    paddingBottom: 8,
  },
  messageBubbleWrapper: {
    width: "100%",
    flexDirection: "row",
  },
  userBubbleWrapper: {
    justifyContent: "flex-end",
  },
  aiBubbleWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 3,
  },
  userBubble: {
    backgroundColor: "#1E4E8C",
    borderBottomRightRadius: 3,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  aiSenderLabel: {
    color: "#64748B",
  },
  userSenderLabel: {
    color: "#E0F2FE",
  },
  timestamp: {
    fontSize: 9,
  },
  aiTimestamp: {
    color: "#94A3B8",
  },
  userTimestamp: {
    color: "#BAE6FD",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  aiMessageText: {
    color: "#1E293B",
  },
  userMessageText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 8,
  },
  errorTextContainer: {
    flex: 1,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#DC2626",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  suggestionsSection: {
    marginBottom: 8,
  },
  suggestionsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  suggestionsHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  suggestedChipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  suggestionChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  suggestionChipText: {
    fontSize: 11,
    color: "#1E4E8C",
    fontWeight: "600",
  },
  feedbackCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#DCFCE7",
    paddingBottom: 6,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  feedbackSection: {
    gap: 2,
  },
  feedbackSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },
  feedbackSectionText: {
    fontSize: 12,
    color: "#1E293B",
    lineHeight: 16,
  },
  feedbackExampleBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  feedbackExampleLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  feedbackExampleText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#059669",
    fontWeight: "600",
  },
  goalSuccessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  goalSuccessText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "600",
    flex: 1,
  },
  footerSection: {
    gap: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#1E293B",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1E4E8C",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  concludeEarlyBtn: {
    alignSelf: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  concludeEarlyText: {
    fontSize: 11,
    color: "#64748B",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    marginTop: 4,
  },
  diagCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 4,
  },
  diagHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  diagText: {
    fontSize: 11,
    color: "#334155",
    lineHeight: 15,
  },
});
