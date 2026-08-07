import React from 'react';
import Svg, { Path } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'home-outline'
  | 'book'
  | 'book-outline'
  | 'bar-chart'
  | 'bar-chart-outline'
  | 'person'
  | 'person-outline'
  | 'flag-outline'
  | 'time-outline'
  | 'star'
  | 'arrow-forward'
  | 'arrow-back'
  | 'checkmark'
  | 'lock-outline'
  | 'location-outline'
  | 'information-circle-outline'
  | 'chatbubble-outline'
  | 'refresh-outline'
  | 'create'
  | 'create-outline'
  | 'volume-high'
  | 'mic-outline'
  | 'list-outline'
  | 'checkmark-circle-outline'
  | 'notifications-outline'
  | 'shield-checkmark-outline';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 20, color = '#1E4E8C' }: IconProps) {
  const renderPath = () => {
    switch (name) {
      case 'home':
        return <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />;
      case 'home-outline':
        return (
          <Path
            d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z"
            fill={color}
          />
        );
      case 'book':
        return (
          <Path
            d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"
            fill={color}
          />
        );
      case 'book-outline':
        return (
          <Path
            d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"
            fill={color}
          />
        );
      case 'bar-chart':
        return <Path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13h2.8v6h-2.8z" fill={color} />;
      case 'bar-chart-outline':
        return (
          <Path
            d="M19 19H5V5h2v12h12v2zM9 10h2v5H9v-5zm4-3h2v8h-2V7zm4 5h2v3h-2v-3z"
            fill={color}
          />
        );
      case 'person':
        return (
          <Path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill={color}
          />
        );
      case 'person-outline':
        return (
          <Path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"
            fill={color}
          />
        );
      case 'flag-outline':
        return (
          <Path
            d="M12.36 6l.08.4.36 1.6H17v6h-3.36l-.08-.4-.36-1.6H7V6h5.36M14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6L14 4z"
            fill={color}
          />
        );
      case 'time-outline':
        return (
          <Path
            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
            fill={color}
          />
        );
      case 'star':
        return (
          <Path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={color}
          />
        );
      case 'arrow-forward':
        return (
          <Path
            d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
            fill={color}
          />
        );
      case 'arrow-back':
        return (
          <Path
            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            fill={color}
          />
        );
      case 'checkmark':
        return <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill={color} />;
      case 'lock-outline':
        return (
          <Path
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
            fill={color}
          />
        );
      case 'location-outline':
        return (
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill={color}
          />
        );
      case 'information-circle-outline':
        return (
          <Path
            d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill={color}
          />
        );
      case 'chatbubble-outline':
        return (
          <Path
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
            fill={color}
          />
        );
      case 'refresh-outline':
        return (
          <Path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            fill={color}
          />
        );
      case 'create':
      case 'create-outline':
        return (
          <Path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            fill={color}
          />
        );
      case 'volume-high':
        return (
          <Path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            fill={color}
          />
        );
      case 'mic-outline':
        return (
          <Path
            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            fill={color}
          />
        );
      case 'list-outline':
        return (
          <Path
            d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
            fill={color}
          />
        );
      case 'checkmark-circle-outline':
        return (
          <Path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
            fill={color}
          />
        );
      case 'notifications-outline':
        return (
          <Path
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"
            fill={color}
          />
        );
      case 'shield-checkmark-outline':
        return (
          <Path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 19.93c-4.04-1.12-7-5.18-7-9.58V6.3l7-3.11 7 3.11v5.05c0 4.4-2.96 8.46-7 9.58zm-1.41-6.34L7.5 11.5l1.41-1.41 1.68 1.68 4.24-4.24 1.41 1.41z"
            fill={color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPath()}
    </Svg>
  );
}
