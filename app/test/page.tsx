"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckCircle, XCircle, Award, User, Mail, Calendar, Download, FileText } from 'lucide-react';

// Mock test questions data
const mockTestQuestions = [
  {
    id: '1',
    question_text: 'What is the primary purpose of React hooks?',
    question_type: 'multiple_choice',
    options: [
      'To replace class components entirely',
      'To manage state and side effects in functional components',
      'To improve performance of React applications',
      'To handle routing in React applications'
    ],
    correct_answer: 'To manage state and side effects in functional components',
    explanation: 'React hooks allow you to use state and other React features in functional components, making them more powerful and easier to work with.',
    difficulty_level: 'medium',
    order_index: 1
  },
  {
    id: '2',
    question_text: 'Which of the following are valid React hooks? (Select all that apply)',
    question_type: 'multiple_select',
    options: [
      'useState',
      'useEffect',
      'useContext',
      'useClass',
      'useReducer'
    ],
    correct_answer: ['useState', 'useEffect', 'useContext', 'useReducer'],
    explanation: 'useState, useEffect, useContext, and useReducer are all valid React hooks. useClass is not a valid hook.',
    difficulty_level: 'easy',
    order_index: 2
  },
  {
    id: '3',
    question_text: 'What does the useEffect hook do?',
    question_type: 'multiple_choice',
    options: [
      'It creates state variables',
      'It handles side effects in functional components',
      'It optimizes component rendering',
      'It manages component lifecycle'
    ],
    correct_answer: 'It handles side effects in functional components',
    explanation: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.',
    difficulty_level: 'medium',
    order_index: 3
  },
  {
    id: '4',
    question_text: 'True or False: React components must always return JSX.',
    question_type: 'true_false',
    options: ['True', 'False'],
    correct_answer: 'False',
    explanation: 'React components can return JSX, strings, numbers, arrays, fragments, portals, or null. They don\'t always have to return JSX.',
    difficulty_level: 'easy',
    order_index: 4
  },
  {
    id: '5',
    question_text: 'What is the virtual DOM in React?',
    question_type: 'multiple_choice',
    options: [
      'A copy of the real DOM stored in memory',
      'A faster version of the real DOM',
      'A JavaScript representation of the real DOM',
      'A backup of the DOM for error recovery'
    ],
    correct_answer: 'A JavaScript representation of the real DOM',
    explanation: 'The virtual DOM is a JavaScript representation of the real DOM that React uses to optimize rendering by comparing changes and updating only what\'s necessary.',
    difficulty_level: 'medium',
    order_index: 5
  }
];

const mockCourseData = {
  id: 'course-1',
  title: 'React Fundamentals',
  instructor: 'John Doe',
  passingScore: 70
};

interface Answer {
  [questionId: string]: string | string[];
}

interface TestResults {
  correct: number;
  total: number;
  percentage: number;
  timeTaken: number;
  passed: boolean;
}

interface CertificateData {
  id: string;
  certificate_number: string;
  first_name: string;
  last_name: string;
  course_title: string;
  instructor: string;
  completion_date: string;
  issued_date: string;
}

export default function TestInterface() {
  const [currentStep, setCurrentStep] = useState('instructions'); // instructions, test, results, certificate
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [certificateForm, setCertificateForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStarted && !testCompleted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, testCompleted, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setCurrentStep('test');
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]): void => {
    setAnswers((prev: Answer) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockTestQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    
    mockTestQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correct_answer;
      
      if (question.question_type === 'multiple_select') {
        // For multiple select, check if arrays are equal
        const userArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const correctArray = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
        if (JSON.stringify(userArray) === JSON.stringify(correctArray)) {
          correctAnswers++;
        }
      } else {
        // For single select questions
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });
    
    return {
      correct: correctAnswers,
      total: mockTestQuestions.length,
      percentage: Math.round((correctAnswers / mockTestQuestions.length) * 100)
    };
  };

  const handleSubmitTest = () => {
    setTestCompleted(true);
    const results = calculateScore();
    const timeTaken = (30 * 60) - timeLeft;
    
    const testResults: TestResults = {
      ...results,
      timeTaken,
      passed: results.percentage >= mockCourseData.passingScore
    };
    
    setTestResults(testResults);
    setCurrentStep('results');
  };

  const handleGenerateCertificate = () => {
    if (testResults?.passed) {
      setCurrentStep('certificate');
    }
  };

  const generateCertificate = async () => {
    if (!certificateForm.firstName.trim() || !certificateForm.lastName.trim()) {
      setCertificateError('Please enter your first and last name');
      return;
    }

    setIsGenerating(true);
    setCertificateError(null);

    try {
      // Generate certificate number
      const certificateNumber = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create certificate data
      const certificateData: CertificateData = {
        id: Math.random().toString(36).substr(2, 9),
        certificate_number: certificateNumber,
        first_name: certificateForm.firstName.trim(),
        last_name: certificateForm.lastName.trim(),
        course_title: mockCourseData.title,
        instructor: mockCourseData.instructor,
        completion_date: new Date().toISOString(),
        issued_date: new Date().toISOString()
      };

      setCertificate(certificateData);
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      setCertificateError(error.message || 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      // Create a downloadable HTML certificate
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate of Completion</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; margin: 0; }
            .certificate { border: 10px solid #0066cc; padding: 50px; margin: 20px auto; max-width: 800px; }
            .header { font-size: 48px; color: #0066cc; margin-bottom: 20px; }
            .title { font-size: 24px; margin-bottom: 30px; }
            .name { font-size: 36px; color: #333; margin: 20px 0; font-weight: bold; }
            .course { font-size: 28px; color: #0066cc; margin: 20px 0; }
            .details { font-size: 16px; color: #666; margin-top: 30px; }
            .signature { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">🏆 CERTIFICATE OF COMPLETION 🏆</div>
            <div class="title">This is to certify that</div>
            <div class="name">${certificate.first_name} ${certificate.last_name}</div>
            <div class="title">has successfully completed</div>
            <div class="course">${certificate.course_title}</div>
            <div class="details">
              <p>Instructor: ${certificate.instructor}</p>
              <p>Score: ${testResults?.percentage || 0}%</p>
              <p>Completion Date: ${new Date(certificate.completion_date).toLocaleDateString()}</p>
              <p>Certificate Number: ${certificate.certificate_number}</p>
            </div>
            <div class="signature">
              <p>Authorized Signature</p>
              <p>________________________</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mockCourseData.title}-Certificate.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setCertificateError('Failed to download certificate');
    }
  };

  const renderInstructions = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 Course Test Instructions
        </CardTitle>
        <CardDescription>
          Please read the instructions carefully before starting the test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Overview</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Course: {mockCourseData.title}</p>
            <p>• Total Questions: {mockTestQuestions.length}</p>
            <p>• Time Limit: 30 minutes</p>
            <p>• Passing Score: {mockCourseData.passingScore}%</p>
            <p>• Question Types: Multiple Choice, Multiple Select, True/False</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            <li>• You can navigate between questions using Next/Previous buttons</li>
            <li>• All questions must be answered before submitting</li>
            <li>• The test will auto-submit when time runs out</li>
            <li>• You can retake the test if you don't pass</li>
            <li>• Certificate will be available after passing the test</li>
          </ul>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button onClick={handleStartTest} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Start Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTestQuestion = () => {
    const question = mockTestQuestions[currentQuestion];
    const userAnswer = answers[question.id];
    
    return (
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {mockTestQuestions.length}
            </Badge>
            <Badge variant="secondary" className={question.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' : 
                                                 question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                                 'bg-red-100 text-red-800'}>
              {question.difficulty_level}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="w-5 h-5" />
            <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / mockTestQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.question_type === 'multiple_choice' || question.question_type === 'true_false' ? (
              <RadioGroup 
                value={userAnswer as string || ''} 
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                    <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : question.question_type === 'multiple_select' ? (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`${question.id}-${index}`}
                      checked={((userAnswer as string[]) || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = (userAnswer as string[]) || [];
                        if (checked) {
                          handleAnswerChange(question.id, [...currentAnswers, option]);
                        } else {
                          handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === mockTestQuestions.length - 1 ? (
              <Button 
                onClick={handleSubmitTest}
                className="bg-green-600 hover:bg-green-700"
                disabled={Object.keys(answers).length < mockTestQuestions.length}
              >
                Submit Test
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                disabled={currentQuestion === mockTestQuestions.length - 1}
              >
                Next
              </Button>
            )}
          </div>
        </div>
        
        {/* Answer Status */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Answered: {Object.keys(answers).length} of {mockTestQuestions.length} questions
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {testResults?.passed ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              Test Passed!
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-600" />
              Test Failed
            </>
          )}
        </CardTitle>
        <CardDescription>
          {testResults?.passed 
            ? 'Congratulations! You have successfully passed the test.'
            : 'You need to score at least 70% to pass. You can retake the test.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`border rounded-lg p-4 ${testResults?.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Your Score</p>
              <p className={`text-2xl font-bold ${testResults?.passed ? 'text-green-600' : 'text-red-600'}`}>
                {testResults?.percentage}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Correct Answers</p>
              <p className="text-2xl font-bold">
                {testResults?.correct}/{testResults?.total}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Time Taken</p>
              <p className="font-medium">
                {Math.floor((testResults?.timeTaken || 0) / 60)}m {(testResults?.timeTaken || 0) % 60}s
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-medium ${testResults?.passed ? 'text-green-600' : 'text-red-600'}`}>
                {testResults?.passed ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-center">
          {testResults?.passed && (
            <Button 
              onClick={handleGenerateCertificate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Award className="w-4 h-4 mr-2" />
              Generate Certificate
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentStep('instructions');
              setCurrentQuestion(0);
              setAnswers({});
              setTimeLeft(30 * 60);
              setTestStarted(false);
              setTestCompleted(false);
              setTestResults(null);
              setCertificate(null);
              setCertificateForm({ firstName: '', lastName: '', email: '' });
            }}
          >
            Retake Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCertificateForm = () => {
    if (certificate) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-600">Certificate Generated!</CardTitle>
            <CardDescription>
              Congratulations! You've successfully completed the course.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Certificate Details</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">
                  {certificate.first_name} {certificate.last_name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  has successfully completed
                </p>
                
                <h4 className="text-md font-semibold text-gray-900 mb-2">
                  {certificate.course_title}
                </h4>
                
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Instructor: {certificate.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Completed: {new Date(certificate.completion_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Badge variant="outline" className="mt-2">
                  #{certificate.certificate_number}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button 
                onClick={downloadCertificate}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Course Certificate',
                      text: `I just completed ${mockCourseData.title} and earned a certificate!`,
                      url: window.location.href
                    });
                  }
                }}
              >
                Share Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Get Your Certificate</CardTitle>
          <CardDescription>
            You've passed the test! Enter your details to generate your certificate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={certificateForm.firstName}
                onChange={(e) => setCertificateForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={certificateForm.lastName}
                onChange={(e) => setCertificateForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={certificateForm.email}
              onChange={(e) => setCertificateForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              required
            />
          </div>

          {certificateError && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {certificateError}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Certificate Preview</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Course:</strong> {mockCourseData.title}</p>
              <p><strong>Instructor:</strong> {mockCourseData.instructor}</p>
              <p><strong>Student:</strong> {certificateForm.firstName || '[First Name]'} {certificateForm.lastName || '[Last Name]'}</p>
              <p><strong>Score:</strong> {testResults?.percentage || 0}%</p>
              <p><strong>Completion Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <Button 
            onClick={generateCertificate}
            disabled={isGenerating || !certificateForm.firstName.trim() || !certificateForm.lastName.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Certificate...</span>
              </div>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" />
                Generate Certificate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{mockCourseData.title}</h1>
          <p className="text-gray-600">Course Assessment Test</p>
        </div>
        
        {/* Content */}
        {currentStep === 'instructions' && renderInstructions()}
        {currentStep === 'test' && renderTestQuestion()}
        {currentStep === 'results' && renderResults()}
        {currentStep === 'certificate' && renderCertificateForm()}
      </div>
    </div>
  );
}