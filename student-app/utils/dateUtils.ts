/**
 * Calculates age from a date of birth.
 * @param dob The date of birth
 * @returns The age in years
 */
export const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    // If today's month is before the birth month, or it's the same month 
    // but today's day is before the birth day, subtract one year.
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    return Math.max(0, age);
};

/**
 * Formats a date for display (e.g., "May 12, 2004")
 */
export const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};
