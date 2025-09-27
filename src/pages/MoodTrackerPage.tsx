import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Calendar, Clock, Activity, Moon, Utensils, 
  Smartphone, Pill, Users, BookOpen, Save, TrendingUp,
  BarChart3, PieChart, Target, Sparkles, Sun, CloudRain,
  Thermometer, Wind, Eye, Brain, Zap, Coffee, Dumbbell
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  RadialBarChart, RadialBar
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { updateStreak } from '../utils/streakManager';

interface MoodEntry {
  id: string;
  date: string;
  primaryMood: string;
  moodIntensity: number;
  energyLevel: string;
  sleepHours: number;
  sleepQuality: string;
  stressLevel: string;
  activities: string[];
  nutrition: string;
  physicalActivity: { minutes: number; type: string };
  screenTime: number;
  medicationCompliance: { taken: boolean; notes: string };
  triggers: string;
  socialInteractions: string;
  gratitude: string;
  notes: string;
  weather: string;
}

function MoodTrackerPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentEntry, setCurrentEntry] = useState<Partial<MoodEntry>>({
    date: new Date().toISOString().split('T')[0],
    primaryMood: '',
    moodIntensity: 5,
    energyLevel: 'Medium',
    sleepHours: 8,
    sleepQuality: 'Average',
    stressLevel: 'Medium',
    activities: [],
    nutrition: 'Balanced',
    physicalActivity: { minutes: 0, type: '' },
    screenTime: 4,
    medicationCompliance: { taken: false, notes: '' },
    triggers: '',
    socialInteractions: 'Online interaction',
    gratitude: '',
    notes: '',
    weather: 'Sunny'
  });
  
  const [viewMode, setViewMode] = useState<'entry' | 'analytics'>('entry');
  const [savedEntries, setSavedEntries] = useState<MoodEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [sleepMoodCorrelation, setSleepMoodCorrelation] = useState<any[]>([]);
  const [averageStats, setAverageStats] = useState({
    averageMood: 0,
    averageSleep: 0,
    averageStress: 0,
    activeDays: 0
  });

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#10B981' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#6B7280' },
    { value: 'sad', emoji: '😔', label: 'Sad', color: '#3B82F6' },
    { value: 'angry', emoji: '😡', label: 'Angry', color: '#EF4444' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#F59E0B' },
    { value: 'tired', emoji: '😴', label: 'Tired', color: '#8B5CF6' },
    { value: 'excited', emoji: '😍', label: 'Excited', color: '#EC4899' }
  ];

  const activityOptions = [
    'Work', 'Study', 'Exercise', 'Meditation', 'Socializing', 'Hobbies', 'Other'
  ];

  const weatherOptions = [
    'Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy'
  ];

  useEffect(() => {
    // Load saved entries from localStorage
    const saved = localStorage.getItem('mindcare_mood_entries');
    if (saved) {
      const entries = JSON.parse(saved);
      setSavedEntries(entries);
      updateAnalyticsData(entries);
    }
  }, []);

  const updateAnalyticsData = (entries: MoodEntry[]) => {
    if (entries.length > 0) {
      // Get last 7 days of data for trends
      const last7Days = entries.slice(-7).map((entry: any) => {
        const stressValue = entry.stressLevel === 'Low' ? 2 : entry.stressLevel === 'Medium' ? 5 : 8;
        const energyValue = entry.energyLevel === 'High' ? 8 : entry.energyLevel === 'Medium' ? 5 : 2;
        
        return {
          date: entry.date,
          mood: entry.moodIntensity || 3,
          sleep: entry.sleepHours || 7,
          stress: stressValue,
          energy: energyValue
        };
      });
      setAnalyticsData(last7Days);

      // Calculate sleep vs mood correlation data
      const correlationData = entries.map((entry: any) => ({
        sleep: entry.sleepHours || 7,
        mood: entry.moodIntensity || 3,
        date: entry.date
      }));
      setSleepMoodCorrelation(correlationData);

      // Calculate weekly activity data
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEntries = entries.filter((entry: any) => entry.date === dateStr);
        const hasEntry = dayEntries.length > 0;
        const avgMood = hasEntry ? dayEntries.reduce((sum: number, entry: any) => sum + (entry.moodIntensity || 3), 0) / dayEntries.length : 0;
        const avgSleep = hasEntry ? dayEntries.reduce((sum: number, entry: any) => sum + (entry.sleepHours || 7), 0) / dayEntries.length : 0;
        
        return {
          day: dayName,
          mood: Math.round(avgMood * 10) / 10,
          sleep: Math.round(avgSleep * 10) / 10,
          hasEntry: hasEntry ? 1 : 0
        };
      });
      setWeeklyActivity(weeklyData);

      // Calculate mood distribution from real data
      const moodCounts = { excellent: 0, good: 0, neutral: 0, sad: 0, verySad: 0 };
      entries.forEach((entry: any) => {
        const mood = entry.moodIntensity || 3;
        if (mood >= 9) moodCounts.excellent++;
        else if (mood >= 7) moodCounts.good++;
        else if (mood >= 5) moodCounts.neutral++;
        else if (mood >= 3) moodCounts.sad++;
        else moodCounts.verySad++;
      });

      const total = entries.length;
      setMoodDistribution([
        { name: 'Excellent', value: Math.round((moodCounts.excellent / total) * 100), color: '#10B981' },
        { name: 'Good', value: Math.round((moodCounts.good / total) * 100), color: '#3B82F6' },
        { name: 'Neutral', value: Math.round((moodCounts.neutral / total) * 100), color: '#F59E0B' },
        { name: 'Sad', value: Math.round((moodCounts.sad / total) * 100), color: '#EF4444' },
        { name: 'Very Sad', value: Math.round((moodCounts.verySad / total) * 100), color: '#DC2626' }
      ]);

      // Calculate average statistics
      const totalMood = entries.reduce((sum: number, entry: any) => sum + (entry.moodIntensity || 3), 0);
      const totalSleep = entries.reduce((sum: number, entry: any) => sum + (entry.sleepHours || 7), 0);
      const totalStress = entries.reduce((sum: number, entry: any) => {
        const stressValue = entry.stressLevel === 'Low' ? 2 : entry.stressLevel === 'Medium' ? 5 : 8;
        return sum + stressValue;
      }, 0);
      
      // Calculate active days (days with entries) in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentEntries = entries.filter((entry: any) => new Date(entry.date) >= thirtyDaysAgo);
      const activeDaysPercentage = Math.round((recentEntries.length / 30) * 100);
      
      setAverageStats({
        averageMood: Math.round((totalMood / entries.length) * 10) / 10,
        averageSleep: Math.round((totalSleep / entries.length) * 10) / 10,
        averageStress: totalStress > 0 ? Math.round((totalStress / entries.length) * 10) / 10 : 5,
        activeDays: activeDaysPercentage
      });
    } else {
      // Default data
      setAnalyticsData([
        { date: new Date().toISOString().split('T')[0], mood: 3, sleep: 7, stress: 4, energy: 6 }
      ]);
      setSleepMoodCorrelation([]);
      setWeeklyActivity([]);
      setMoodDistribution([
        { name: 'Excellent', value: 20, color: '#10B981' },
        { name: 'Good', value: 30, color: '#3B82F6' },
        { name: 'Neutral', value: 30, color: '#F59E0B' },
        { name: 'Sad', value: 15, color: '#EF4444' },
        { name: 'Very Sad', value: 5, color: '#DC2626' }
      ]);
      setAverageStats({
        averageMood: 4.2,
        averageSleep: 7.5,
        averageStress: 3.0,
        activeDays: 85
      });
    }
  };
  const handleInputChange = (field: string, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityToggle = (activity: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      activities: prev.activities?.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...(prev.activities || []), activity]
    }));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.primaryMood) {
      toast.error('Please select your primary mood');
      return;
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      ...currentEntry as MoodEntry
    };

    const updatedEntries = [...savedEntries, newEntry];
    setSavedEntries(updatedEntries);
    localStorage.setItem('mindcare_mood_entries', JSON.stringify(updatedEntries));
    
    // Update streak
    updateStreak();
    
    // Update analytics data
    updateAnalyticsData(updatedEntries);
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mindcare-data-updated'));
    
    toast.success('Mood entry saved successfully!');
    
    // Reset form for next entry
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      primaryMood: '',
      moodIntensity: 5,
      energyLevel: 'Medium',
      sleepHours: 8,
      sleepQuality: 'Average',
      stressLevel: 'Medium',
      activities: [],
      nutrition: 'Balanced',
      physicalActivity: { minutes: 0, type: '' },
      screenTime: 4,
      medicationCompliance: { taken: false, notes: '' },
      triggers: '',
      socialInteractions: 'Online interaction',
      gratitude: '',
      notes: '',
      weather: 'Sunny'
    });
  };

  const getSelectedMoodColor = () => {
    const selected = moodOptions.find(m => m.value === currentEntry.primaryMood);
    return selected?.color || '#6B7280';
  };

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-purple-400' : 'bg-purple-300'
            } opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Mood Tracker
              </h1>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track your daily mood and discover patterns in your mental wellness
              </p>
            </div>
            
            {/* View Toggle */}
            <div className={`flex rounded-xl p-1 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <button
                onClick={() => setViewMode('entry')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'entry'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Daily Entry
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'analytics'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'entry' ? (
            <motion.div
              key="entry"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="space-y-8"
            >
              {/* Primary Mood Selection */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-2xl font-semibold mb-6 flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  <Heart className="w-6 h-6 mr-3 text-purple-500" />
                  How are you feeling today?
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {moodOptions.map((mood) => (
                    <motion.button
                      key={moo