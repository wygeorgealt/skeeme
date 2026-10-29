import React, { useEffect } from 'react';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Palette } from '@/constants/theme';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconColorToken =
  | 'default'
  | 'neutral'
  | 'primary'
  | 'active'
  | 'accent'
  | 'secondary'
  | 'muted'
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'tertiary'
  | 'success'
  | 'destructive'
  | 'warning'
  | 'white'
  | 'border';

export const ICON_SIZES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
};

export type IconAnimationType = boolean | 'pulse' | 'bounce' | 'spin';

const SF_SYMBOL_MAP: Record<string, string> = {
  Search: 'magnifyingglass',
  ChevronLeft: 'chevron.left',
  ChevronRight: 'chevron.right',
  ChevronDown: 'chevron.down',
  ChevronUp: 'chevron.up',
  Bell: 'bell',
  BellRing: 'bell.badge',
  BookOpen: 'book',
  Flashcards: 'rectangle.stack.fill',
  Calendar: 'calendar',
  Check: 'checkmark',
  CheckCircle2: 'checkmark.circle.fill',
  XCircle: 'xmark.circle.fill',
  X: 'xmark',
  Sparkles: 'sparkles',
  Settings: 'gearshape',
  User: 'person',
  Users: 'person.2',
  Mail: 'envelope',
  MessageCircle: 'bubble.left',
  HelpCircle: 'questionmark.circle',
  HelpCircleIcon: 'questionmark.circle',
  Quiz: 'questionmark.circle.fill',
  Plus: 'plus',
  PlusCircle: 'plus.circle',
  Minus: 'minus',
  Folder: 'folder',
  FolderOpen: 'folder.fill',
  Clock: 'clock',
  Bookmark: 'bookmark',
  Award: 'medal',
  TrendingUp: 'chart.line.uptrend.xyaxis',
  ArrowRight: 'arrow.right',
  ArrowLeft: 'arrow.left',
  ArrowUp: 'arrow.up',
  UploadCloud: 'arrow.up.doc',
  PenTool: 'pencil.and.scribble',
  RotateCcw: 'arrow.clockwise',
  Home: 'house',
  History: 'clock.arrow.circlepath',
  MessageSquare: 'bubble.left',
  Library: 'books.vertical',
  CreditCard: 'creditcard',
  Shield: 'shield',
  ShieldCheck: 'shield.checkered',
  MoreHorizontal: 'ellipsis',
  MoreVertical: 'ellipsis',
  CircleHelp: 'questionmark.circle',
  Download: 'arrow.down.to.line',
  Save: 'bookmark.fill',
  BookmarkCheck: 'bookmark.fill',
  Star: 'star.fill',
  Warning: 'exclamationmark.triangle.fill',
  Heart: 'heart.fill',
  Camera: 'camera',
  Play: 'play.fill',
  Pause: 'pause.fill',
  Scan: 'doc.viewfinder',
  Trash: 'trash',
  Trash2: 'trash',
  Lock: 'lock',
  Globe: 'globe',
  MessageCircleMore: 'ellipsis.bubble.fill',
  BarChart3: 'chart.bar',
  CheckSquare: 'checkmark.square',
  Target: 'target',
  Zap: 'bolt.fill',
  Brain: 'brain',
  BrainCircuit: 'brain',
  Notebook: 'note.text',
  Rocket: 'rocket',
  Asterisk: 'asterisk',
  SlidersHorizontal: 'slider.horizontal.3',
  Copy: 'doc.on.doc',
  FileText: 'doc.text',
  AlignLeft: 'text.alignleft',
  Smile: 'face.smiling',
  ListChecks: 'checklist',
  SearchIcon: 'magnifyingglass',
  GraduationCap: 'graduationcap',
  Lightbulb: 'lightbulb',
  Flame: 'flame.fill',
  Trophy: 'trophy',
  Layers: 'layers.3d',
  Share2: 'square.and.arrow.up',
  LogOut: 'rectangle.portrait.and.arrow.right',
  Wechat: 'message',
  Image: 'photo',
  RefreshCw: 'arrow.triangle.2.circlepath',
  Timer: 'timer',
  ListOrdered: 'list.number',
  Briefcase: 'briefcase',
  Bot: 'sparkle',
  AwardIcon: 'medal',
  Info: 'info.circle',
  Eye: 'eye',
  CheckCircle: 'checkmark.circle.fill',
  AlertTriangle: 'exclamationmark.triangle',
  Mic: 'mic',
  Volume2: 'speaker.wave.2',
  BellDot: 'bell.badge',
  MailCheck: 'envelope.badge',
};

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  name?: string;
  icon?: LucideIcon;
  size?: IconSize;
  color?: IconColorToken | string;
  strokeWidth?: number;
  animated?: IconAnimationType;
}

function resolveSymbolName(name?: string): string | undefined {
  if (!name) return undefined;
  const direct = SF_SYMBOL_MAP[name] ?? SF_SYMBOL_MAP[name.replace(/^[a-z]/, (m) => m.toUpperCase())];
  if (direct) return direct;

  const normalized = name
    .replace(/([a-z0-9])([A-Z])/g, '$1.$2')
    .replace(/[^a-zA-Z0-9.]/g, '')
    .toLowerCase();

  return normalized || undefined;
}

export function Icon({
  name,
  icon: IconComponentProp,
  size = 'md',
  color = 'default',
  strokeWidth = 2,
  animated = false,
  style,
  ...rest
}: IconProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const resolvedSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.md;

  const resolveColor = (c: IconColorToken | string): string => {
    switch (c) {
      case 'default':
      case 'neutral':
      case 'text':
      case 'textPrimary':
        return C.icon;
      case 'secondary':
      case 'muted':
      case 'textSecondary':
        return C.iconSecondary;
      case 'tertiary':
      case 'textTertiary':
      case 'iconMuted':
        return C.iconTertiary;
      case 'primary':
      case 'active':
      case 'brand':
        return C.primary;
      case 'accent':
        return Palette.blue.accent;
      case 'success':
        return C.success;
      case 'destructive':
        return C.destructive;
      case 'warning':
        return C.warning;
      case 'white':
        return '#FFFFFF';
      case 'border':
        return C.border;
      default:
        if (c === 'textTertiary' || c === 'tertiary') return C.iconTertiary;
        if (c === 'textSecondary' || c === 'muted' || c === 'secondary') return C.iconSecondary;
        if (c === 'textPrimary' || c === 'text' || c === 'default') return C.icon;
        if (c === 'primary' || c === 'active') return C.primary;
        return c;
    }
  };

  const resolvedColor = resolveColor(color);

  const symbolName = name ? resolveSymbolName(name) : undefined;
  const useSystemSymbol = !IconComponentProp && Platform.OS === 'ios' && Boolean(symbolName);
  const ComponentToRender =
    IconComponentProp ??
    (name ? (LucideIcons as unknown as Record<string, LucideIcon>)[name] : undefined);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      scale.value = 1;
      rotation.value = 0;
      translateY.value = 0;
      return;
    }

    if (animated === 'spin') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else if (animated === 'bounce') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated, rotation, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (useSystemSymbol && symbolName) {
    const symbolElement = (
      <SymbolView
        name={symbolName as any}
        size={resolvedSize}
        tintColor={resolvedColor}
        style={{ width: resolvedSize, height: resolvedSize }}
      />
    );

    return animated ? (
      <Animated.View style={[animatedStyle, style, { alignItems: 'center', justifyContent: 'center' }]}>
        {symbolElement}
      </Animated.View>
    ) : symbolElement;
  }

  if (!ComponentToRender) {
    return null;
  }

  const iconElement = (
    <ComponentToRender
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      style={!animated ? style : undefined}
      {...rest}
    />
  );

  if (animated) {
    return <Animated.View style={[animatedStyle, style]}>{iconElement}</Animated.View>;
  }

  return iconElement;
}

export default Icon;
