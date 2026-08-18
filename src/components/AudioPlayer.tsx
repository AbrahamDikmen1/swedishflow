import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import Icon from './Icon';
import { audioService, AudioPlaybackState } from '../services/audioService';

interface AudioPlayerProps {
  text: string;
  audioUrl?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  audioUrl,
  label,
  size = 'medium',
  compact = false,
}) => {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isLoading: false,
    hasError: false,
    hasAudioResource: Boolean(audioUrl),
  });

  const handlePlay = async () => {
    if (playbackState.isPlaying) {
      audioService.stopAll();
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    await audioService.playPhrase(text, audioUrl, (status) => {
      setPlaybackState(status);
    });
  };

  const isSmall = size === 'small' || compact;

  return (
    <View style={[styles.container, isSmall && styles.containerCompact]}>
      <TouchableOpacity
        style={[
          styles.playButton,
          isSmall && styles.playButtonSmall,
          playbackState.isPlaying && styles.playButtonPlaying,
        ]}
        onPress={handlePlay}
        disabled={playbackState.isLoading}
        accessibilityRole="button"
        accessibilityLabel={playbackState.isPlaying ? 'Pausa ljud' : `Lyssna på: ${text}`}
      >
        {playbackState.isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Icon
            name={playbackState.isPlaying ? 'pause' : 'volume-high-outline'}
            size={isSmall ? 18 : 22}
            color={playbackState.isPlaying ? '#FFFFFF' : theme.colors.primary}
          />
        )}
      </TouchableOpacity>

      {!compact && (
        <View style={styles.textContainer}>
          {label ? <Text style={styles.labelText}>{label}</Text> : null}
          <View style={styles.badgeRow}>
            {audioUrl ? (
              <View style={styles.studioBadge}>
                <Text style={styles.studioBadgeText}>Studioinspelat ljud</Text>
              </View>
            ) : (
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>Talsyntes (förhandsgranskning)</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {playbackState.hasError && (
        <Text style={styles.errorText}>{playbackState.errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginVertical: 4,
  },
  containerCompact: {
    marginVertical: 0,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  playButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  playButtonPlaying: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  textContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  studioBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  studioBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#03543F',
  },
  previewBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewBadgeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.error,
  },
});
