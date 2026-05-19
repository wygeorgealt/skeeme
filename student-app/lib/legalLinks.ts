import { Linking } from 'react-native';

export const TERMS_URL = 'https://skeeme.com/terms';
export const PRIVACY_URL = 'https://skeeme.com/privacy';

export function openLegalLink(url: string) {
    return Linking.openURL(url);
}
