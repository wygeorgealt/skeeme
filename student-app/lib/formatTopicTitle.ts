export function formatTopicTitle(topic?: string | null): string {
    if (!topic) return '';

    const lowercaseWords = new Set(['of', 'and', 'or', 'in']);

    return topic.trim().replace(/[A-Za-z]+/g, (word) => {
        const isAcronym = word.length > 1 && word === word.toUpperCase();
        if (lowercaseWords.has(word.toLowerCase())) return word.toLowerCase();
        return isAcronym
            ? word
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}
