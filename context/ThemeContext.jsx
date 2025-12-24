import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState(systemScheme || 'light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user_theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                } else if (systemScheme) {
                    setTheme(systemScheme);
                }
            } catch (error) {
                console.warn('Failed to load theme:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
    };

    const setThemeValue = async (newTheme) => {
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeValue, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
