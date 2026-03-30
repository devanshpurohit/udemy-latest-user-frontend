/**
 * Extracts the appropriate language string from a localized object.
 * @param {string|object} data - The localized data (e.g., { en: 'Title', kn: 'ಶೀರ್ಷಿಕೆ' })
 * @param {string} userLanguage - The user's preferred language ('English' or 'Kannada')
 * @returns {string} - The extracted string or empty string.
 */
export const getLangText = (data, userLanguage) => {
    if (!data) return '';
    
    // If it's already a string, return it
    if (typeof data === 'string') return data;
    
    // If it's an object with language keys
    if (typeof data === 'object') {
        const langCode = userLanguage === 'Kannada' ? 'kn' : 'en';
        
        // Try the preferred language first
        if (data[langCode]) return data[langCode];
        
        // Fallback to English
        if (data['en']) return data['en'];
        
        // Fallback to Kannada if English is missing
        if (data['kn']) return data['kn'];
        
        // Fallback to any first available key
        const keys = Object.keys(data);
        if (keys.length > 0) return data[keys[0]];
    }
    
    return '';
};
