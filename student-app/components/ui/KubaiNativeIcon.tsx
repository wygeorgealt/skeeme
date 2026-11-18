import { useId, useMemo } from 'react';
import type { KubaiIconData } from 'kubai-icons';
import {
    SvgXml,
} from 'react-native-svg';
import BookMarked from 'kubai-icons/icons/book-marked';
import BookOpen from 'kubai-icons/icons/book-open';
import CircleCheck from 'kubai-icons/icons/circle-check';
import CircleX from 'kubai-icons/icons/circle-x';
import CloudUpload from 'kubai-icons/icons/cloud-upload';
import FileText from 'kubai-icons/icons/file-text';
import Flame from 'kubai-icons/icons/flame';
import Home from 'kubai-icons/icons/home';
import Layers from 'kubai-icons/icons/layers';
import MoreHorizontal from 'kubai-icons/icons/more-horizontal';
import NotebookPen from 'kubai-icons/icons/notebook-pen';
import Quiz from 'kubai-icons/icons/quiz';
import UserRound from 'kubai-icons/icons/user-round';

const icons = {
    home: Home,
    library: BookMarked,
    profile: UserRound,
    options: MoreHorizontal,
    notes: FileText,
    quiz: Quiz,
    streak: Flame,
    activeDays: CircleCheck,
    newNote: NotebookPen,
    upload: CloudUpload,
    summary: BookOpen,
    flashcards: Layers,
    close: CircleX,
} satisfies Record<string, KubaiIconData>;

export type KubaiNativeIconName = keyof typeof icons;

interface KubaiNativeIconProps {
    name: KubaiNativeIconName;
    size: number;
    color: string;
}

function resolveColorVariables(value: string, color: string) {
    return value
        .replaceAll('var(--ki-e,var(--ki-c,currentColor))', color)
        .replaceAll('var(--ki-c,currentColor)', color)
        .replaceAll('var(--ki-w,#fff)', '#fff')
        .replaceAll('var(--ki-l,0%)', '0%')
        .replaceAll('currentColor', color);
}

function splitTopLevel(value: string, separator: string) {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;

    for (let index = 0; index < value.length; index += 1) {
        if (value[index] === '(') depth += 1;
        if (value[index] === ')') depth -= 1;
        if (value[index] === separator && depth === 0) {
            parts.push(value.slice(start, index).trim());
            start = index + 1;
        }
    }

    parts.push(value.slice(start).trim());
    return parts;
}

function hexToRgb(value: string) {
    const hex = value.replace(/^#/, '');
    const normalized = hex.length === 3
        ? hex.split('').map((digit) => digit + digit).join('')
        : hex;

    if (!/^[\da-f]{6}$/i.test(normalized)) {
        throw new Error(`Unsupported Kubai icon color: ${value}`);
    }

    return [
        Number.parseInt(normalized.slice(0, 2), 16),
        Number.parseInt(normalized.slice(2, 4), 16),
        Number.parseInt(normalized.slice(4, 6), 16),
    ];
}

function rgbToHex(rgb: number[]) {
    return `#${rgb
        .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;
}

function mixColors(expression: string) {
    const [space, ...stops] = splitTopLevel(expression, ',');
    if (space !== 'in srgb' || stops.length !== 2) {
        throw new Error(`Unsupported Kubai icon color mix: ${expression}`);
    }

    const parseStop = (value: string) => {
        const match = value.match(/^(.*?)\s+([\d.]+)%$/);
        return {
            color: match ? match[1].trim() : value,
            weight: match ? Number(match[2]) : undefined,
        };
    };

    const first = parseStop(stops[0]);
    const second = parseStop(stops[1]);
    const firstWeight =
        first.weight ?? (second.weight === undefined ? 50 : 100 - second.weight);
    const secondWeight =
        second.weight ?? (first.weight === undefined ? 50 : 100 - first.weight);
    const totalWeight = firstWeight + secondWeight;
    const firstRgb = hexToRgb(first.color);
    const secondRgb = hexToRgb(second.color);

    return rgbToHex(
        firstRgb.map(
            (channel, index) =>
                (channel * firstWeight + secondRgb[index] * secondWeight) /
                totalWeight,
        ),
    );
}

function resolveColorMixes(value: string, color: string) {
    const prefix = 'color-mix(';
    let output = '';
    let cursor = 0;

    while (cursor < value.length) {
        const start = value.indexOf(prefix, cursor);
        if (start === -1) break;

        output += value.slice(cursor, start);
        let depth = 1;
        let end = -1;

        for (let index = start + prefix.length; index < value.length; index += 1) {
            if (value[index] === '(') depth += 1;
            if (value[index] === ')') {
                depth -= 1;
                if (depth === 0) {
                    end = index;
                    break;
                }
            }
        }

        if (end === -1) {
            throw new Error('Unclosed Kubai icon color mix');
        }

        const expression = resolveColorVariables(
            resolveColorMixes(value.slice(start + prefix.length, end), color),
            color,
        );
        output += mixColors(expression);
        cursor = end + 1;
    }

    return output + value.slice(cursor);
}

function convertInlineStylesToAttributes(markup: string) {
    return markup.replace(/style="([^"]*)"/g, (_match, declarations: string) =>
        declarations
            .split(';')
            .map((declaration) => declaration.trim())
            .filter(Boolean)
            .map((declaration) => {
                const separator = declaration.indexOf(':');
                if (separator === -1) return '';

                const property = declaration.slice(0, separator).trim();
                const value = declaration.slice(separator + 1).trim();
                return `${property}="${value}"`;
            })
            .filter(Boolean)
            .join(' '),
    );
}

function createNativeSvg(icon: KubaiIconData, color: string, id: string) {
    // Keep Kubai's static SVG design while dropping browser-only filter effects.
    const markup = icon.markup
        .replace(/<filter\b[^>]*>[\s\S]*?<\/filter>/g, '')
        .replace(/\sfilter="[^"]*"/g, '')
        .replace(/\sdata-[\w-]+="[^"]*"/g, '');
    const coloredMarkup = resolveColorVariables(
        resolveColorMixes(markup, color),
        color,
    )
        .replaceAll('__K__', id);

    return convertInlineStylesToAttributes(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -3 31 31" fill="none">${coloredMarkup}</svg>`,
    );
}

export function KubaiNativeIcon({ name, size, color }: KubaiNativeIconProps) {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const xml = useMemo(
        () => createNativeSvg(icons[name], color, id),
        [color, id, name],
    );

    return <SvgXml xml={xml} width={size} height={size} accessible={false} />;
}
