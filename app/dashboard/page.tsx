'use client';

import React, { useState } from 'react';
import { BookOpen, Award, TrendingUp, CheckCircle, Clock, Target, Star, Trophy, Users, Calendar } from 'lucide-react';

export default function DashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('current');
    
    // Sample data - in a real app, this would come from an API
    const courses = [
        {
            id: 1,
            title: "Advanced React Development",
            progress: 85,
            completed: false,
            totalLessons: 24,
            completedLessons: 20,
            testScore: 92,
            category: "Programming",
            dueDate: "2025-08-15",
            instructor: "Sarah Johnson"
        },
        {
            id: 2,
            title: "UI/UX Design Fundamentals",
            progress: 100,
            completed: true,
            totalLessons: 18,
            completedLessons: 18,
            testScore: 88,
            category: "Design",
            dueDate: "2025-07-20",
            instructor: "Mike Chen"
        },
        {
            id: 3,
            title: "Data Science with Python",
            progress: 65,
            completed: false,
            totalLessons: 32,
            completedLessons: 21,
            testScore: 78,
            category: "Data Science",
            dueDate: "2025-09-10",
            instructor: "Dr. Emily Rodriguez"
        },
        {
            id: 4,
            title: "Digital Marketing Strategy",
            progress: 45,
            completed: false,
            totalLessons: 16,
            completedLessons: 7,
            testScore: 85,
            category: "Marketing",
            dueDate: "2025-08-30",
            instructor: "John Smith"
        }
    ];

    const achievements = [
        {
            id: 1,
            title: "First Course Complete",
            description: "Successfully completed your first course",
            icon: "🎓",
            earned: true,
            date: "2025-07-01"
        },
        {
            id: 2,
            title: "High Scorer",
            description: "Achieved 90+ score on a test",
            icon: "🏆",
            earned: true,
            date: "2025-07-05"
        },
        {
            id: 3,
            title: "Consistent Learner",
            description: "Completed lessons for 7 consecutive days",
            icon: "🔥",
            earned: true,
            date: "2025-07-10"
        },
        {
            id: 4,
            title: "Course Master",
            description: "Complete 5 courses with 85+ average",
            icon: "⭐",
            earned: false,
            date: null
        }
    ];

    const stats = {
        totalCourses: courses.length,
        completedCourses: courses.filter(c => c.completed).length,
        averageScore: Math.round(courses.reduce((acc, c) => acc + c.testScore, 0) / courses.length),
        totalHours: 156,
        streak: 12
    };

    interface Course {
        id: number;
        title: string;
        progress: number;
        completed: boolean;
        totalLessons: number;
        completedLessons: number;
        testScore: number;
        category: string;
        dueDate: string;
        instructor: string;
    }

    interface Achievement {
        id: number;
        title: string;
        description: string;
        icon: string;
        earned: boolean;
        date: string | null;
    }

    interface Stats {
        totalCourses: number;
        completedCourses: number;
        averageScore: number;
        totalHours: number;
        streak: number;
    }

        const getProgressColor = (progress: number): string => {
            if (progress >= 90) return 'bg-green-500';
            if (progress >= 70) return 'bg-blue-500';
            if (progress >= 50) return 'bg-yellow-500';
            return 'bg-red-500';
        };

    interface ScoreColorResult {
        className: string;
    }

    const getScoreColor = (score: number): string => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 80) return 'text-blue-600 bg-blue-100';
        if (score >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
                    <p className="text-gray-600">Track your progress and achievements</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Score</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
                            </div>
                            <Target className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.totalHours}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Day Streak</p>
                                <p className="text-3xl font-bold text-red-600">{stats.streak}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course Progress */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Course Progress</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setSelectedPeriod('current')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedPeriod === 'current' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Current
                                    </button>
                                    <button
                                        onClick={() => setSelectedPeriod('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedPeriod === 'all' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        All Time
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {courses.map((course) => (
                                    <div key={course.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        {course.instructor}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        Due: {new Date(course.dueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(course.testScore)}`}>
                                                    <Star className="w-4 h-4 mr-1" />
                                                    {course.testScore}%
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                                <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                                                    style={{width: `${course.progress}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>{course.completedLessons} / {course.totalLessons} lessons completed</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                course.completed 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {course.completed ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
                            <div className="space-y-4">
                                {achievements.map((achievement) => (
                                    <div 
                                        key={achievement.id} 
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                            achievement.earned 
                                                ? 'border-yellow-300 bg-yellow-50 shadow-md hover:shadow-lg' 
                                                : 'border-gray-200 bg-gray-50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`text-2xl ${achievement.earned ? 'grayscale-0' : 'grayscale'}`}>
                                                {achievement.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {achievement.title}
                                                </h3>
                                                <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {achievement.description}
                                                </p>
                                                {achievement.earned && achievement.date && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Earned: {new Date(achievement.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Scores Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Performance</h2>
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                                            <p className="text-xs text-gray-500">{course.category}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(course.testScore)}`}>
                                            {course.testScore}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Overall Average</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
                                    </div>
                                    <Trophy className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}