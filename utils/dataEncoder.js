// Base64 polyfill for React Native
import { Buffer } from 'buffer';

// Polyfill for btoa/atob in React Native
if (typeof global.btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
    global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}

/**
 * Encode JSON data to a secure format
 * Uses Base64 encoding with optional XOR encryption for basic obfuscation
 * @param {Object} data - JSON object to encode
 * @returns {String} - Encoded string
 */
export async function encodeProjectData(data) {
    try {
        // Step 1: Convert JSON to string
        const jsonString = JSON.stringify(data);

        // Step 2: Convert to Base64
        const base64Data = Buffer.from(jsonString, 'utf-8').toString('base64');

        // Step 3: Add simple XOR encryption for additional obfuscation
        const key = 'SketchNote2025'; // Simple key for XOR
        let encrypted = '';
        for (let i = 0; i < base64Data.length; i++) {
            encrypted += String.fromCharCode(
                base64Data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        // Step 4: Convert encrypted data to Base64 again
        const finalEncoded = Buffer.from(encrypted, 'binary').toString('base64');

        return finalEncoded;
    } catch (error) {
        console.error('Error encoding project data:', error);
        throw new Error('Failed to encode project data');
    }
}

/**
 * Decode encoded project data back to JSON
 * @param {String} encodedData - Encoded string
 * @returns {Object} - Decoded JSON object
 */
export function decodeProjectData(encodedData) {
    try {
        // Step 1: Decode from Base64
        const encrypted = Buffer.from(encodedData, 'base64').toString('binary');

        // Step 2: XOR decrypt
        const key = 'SketchNote2025';
        let base64Data = '';
        for (let i = 0; i < encrypted.length; i++) {
            base64Data += String.fromCharCode(
                encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        // Step 3: Decode from Base64
        const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');

        // Step 4: Parse JSON
        const data = JSON.parse(jsonString);

        return data;
    } catch (error) {
        console.error('Error decoding project data:', error);
        throw new Error('Failed to decode project data. File may be corrupted or invalid.');
    }
}

/**
 * Check if data is encoded or plain JSON
 * @param {String} data - Data string to check
 * @returns {Boolean} - True if encoded, false if plain JSON
 */
export function isEncodedData(data) {
    try {
        // Try to parse as JSON first
        JSON.parse(data);
        return false; // If successful, it's plain JSON
    } catch {
        // If JSON parse fails, check if it looks like Base64
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        return base64Regex.test(data.trim());
    }
}
