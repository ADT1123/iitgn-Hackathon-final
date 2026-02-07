// src/components/assessment/AssessmentBuilder.tsx
// FEATURE 16: Customizable Assessment Builder

import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, GripVertical, Settings, Wand2, Save,
    Eye, Copy, Clock, Target, Code, FileText, CheckSquare
} from 'lucide-react';
import { assessmentAPI } from '@/services/api';
import './AssessmentBuilder.css';

interface Question {
    id: string;
    type: 'objective' | 'subjective' | 'coding';
    text: string;
    options?: string[];
    correctAnswer?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    skills: string[];
    points: number;
    timeLimit?: number;
    testCases?: { input: string; output: string }[];
}

interface AssessmentConfig {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    sections: {
        objective: { count: number; pointsEach: number };
        subjective: { count: number; pointsEach: number };
        coding: { count: number; pointsEach: number };
    };
}

interface AssessmentBuilderProps {
    jobId: string;
    parsedJD?: any;
    onSave: (assessment: any) => void;
    onCancel: () => void;
}

const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
    jobId,
    parsedJD,
    onSave,
    onCancel
}) => {
    const [config, setConfig] = useState<AssessmentConfig>({
        title: parsedJD?.title ? `Assessment for ${parsedJD.title}` : 'New Assessment',
        description: '',
        duration: 60,
        passingScore: 60,
        shuffleQuestions: true,
        showResults: false,
        sections: {
            objective: { count: 10, pointsEach: 2 },
            subjective: { count: 3, pointsEach: 10 },
            coding: { count: 2, pointsEach: 25 }
        }
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState<'config' | 'questions' | 'preview'>('config');
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const extractedSkills = parsedJD?.primarySkills || [];

    const generateQuestionId = () => Math.random().toString(36).substr(2, 9);

    const addQuestion = (type: Question['type']) => {
        const newQuestion: Question = {
            id: generateQuestionId(),
            type,
            text: '',
            difficulty: 'medium',
            skills: [],
            points: type === 'objective' ? 2 : type === 'subjective' ? 10 : 25,
            options: type === 'objective' ? ['', '', '', ''] : undefined,
            correctAnswer: type === 'objective' ? 0 : undefined,
            testCases: type === 'coding' ? [{ input: '', output: '' }] : undefined
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, ...updates } : q
        ));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (selectedQuestionId === id) {
            setSelectedQuestionId(null);
        }
    };

    const duplicateQuestion = (id: string) => {
        const question = questions.find(q => q.id === id);
        if (question) {
            const duplicate = { ...question, id: generateQuestionId() };
            const index = questions.findIndex(q => q.id === id);
            const newQuestions = [...questions];
            newQuestions.splice(index + 1, 0, duplicate);
            setQuestions(newQuestions);
        }
    };

    const handleGenerateQuestions = async () => {
        setIsGenerating(true);
        try {
            const response = await assessmentAPI.generateQuestions(jobId, {
                objectiveCount: config.sections.objective.count,
                subjectiveCount: config.sections.subjective.count,
                codingCount: config.sections.coding.count,
                duration: config.duration,
                difficulty: 'medium', // Default for auto-gen
                title: config.title
            });

            if (response.data.success) {
                const generatedQuestions: Question[] = response.data.data.questions.map((q: any) => ({
                    id: q._id || generateQuestionId(),
                    type: q.type === 'programming' ? 'coding' : q.type,
                    text: q.question,
                    options: q.type === 'objective' ? q.options : undefined,
                    correctAnswer: q.type === 'objective' ? q.correctAnswer : undefined,
                    difficulty: q.difficulty || 'medium',
                    skills: [q.skill || 'Technical'],
                    points: q.points,
                    testCases: q.type === 'coding' ? q.testCases : undefined,
                    rubric: q.rubric
                }));

                setQuestions(generatedQuestions);
                setActiveTab('questions');
            }
        } catch (error) {
            console.error('Failed to generate AI questions:', error);
            // Fallback or error notification could be added here
            alert('Failed to generate questions. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        const assessment = {
            ...config,
            jobId,
            questions,
            totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
            createdAt: new Date()
        };
        onSave(assessment);
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const questionsByType = {
        objective: questions.filter(q => q.type === 'objective').length,
        subjective: questions.filter(q => q.type === 'subjective').length,
        coding: questions.filter(q => q.type === 'coding').length
    };

    return (
        <div className="assessment-builder">
            {/* Header */}
            <div className="builder-header">
                <div className="header-left">
                    <h2>Assessment Builder</h2>
                    <p>Create customized assessments for your job role</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save className="icon" /> Save Assessment
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="builder-tabs">
                <button
                    className={`tab ${activeTab === 'config' ? 'active' : ''}`}
                    onClick={() => setActiveTab('config')}
                >
                    <Settings className="icon" /> Configuration
                </button>
                <button
                    className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    <FileText className="icon" /> Questions ({questions.length})
                </button>
                <button
                    className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    <Eye className="icon" /> Preview
                </button>
            </div>

            {/* Configuration Tab */}
            {activeTab === 'config' && (
                <div className="tab-content config-tab">
                    <div className="config-grid">
                        <div className="config-section">
                            <h3>Basic Settings</h3>
                            <div className="form-group">
                                <label>Assessment Title</label>
                                <input
                                    type="text"
                                    value={config.title}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                    placeholder="Enter assessment title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={config.description}
                                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                    placeholder="Enter assessment description"
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><Clock className="icon" /> Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={config.duration}
                                        onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                                        min={15}
                                        max={180}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Target className="icon" /> Passing Score (%)</label>
                                    <input
                                        type="number"
                                        value={config.passingScore}
                                        onChange={(e) => setConfig({ ...config, passingScore: parseInt(e.target.value) })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="config-section">
                            <h3>Question Distribution</h3>
                            <div className="section-config">
                                <div className="section-row">
                                    <div className="section-type">
                                        <CheckSquare className="icon" />
                                        <span>Objective</span>
                                    </div>
                                    <div className="section-inputs">
                                        <div className="input-group">
                                            <label>Count</label>
                                            <input
                                                type="number"
                                                value={config.sections.objective.count}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        objective: { ...config.sections.objective, count: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={0}
                                                max={50}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Points Each</label>
                                            <input
                                                type="number"
                                                value={config.sections.objective.pointsEach}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        objective: { ...config.sections.objective, pointsEach: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={1}
                                                max={20}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="section-row">
                                    <div className="section-type">
                                        <FileText className="icon" />
                                        <span>Subjective</span>
                                    </div>
                                    <div className="section-inputs">
                                        <div className="input-group">
                                            <label>Count</label>
                                            <input
                                                type="number"
                                                value={config.sections.subjective.count}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        subjective: { ...config.sections.subjective, count: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={0}
                                                max={20}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Points Each</label>
                                            <input
                                                type="number"
                                                value={config.sections.subjective.pointsEach}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        subjective: { ...config.sections.subjective, pointsEach: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={1}
                                                max={50}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="section-row">
                                    <div className="section-type">
                                        <Code className="icon" />
                                        <span>Coding</span>
                                    </div>
                                    <div className="section-inputs">
                                        <div className="input-group">
                                            <label>Count</label>
                                            <input
                                                type="number"
                                                value={config.sections.coding.count}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        coding: { ...config.sections.coding, count: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={0}
                                                max={10}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Points Each</label>
                                            <input
                                                type="number"
                                                value={config.sections.coding.pointsEach}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    sections: {
                                                        ...config.sections,
                                                        coding: { ...config.sections.coding, pointsEach: parseInt(e.target.value) }
                                                    }
                                                })}
                                                min={1}
                                                max={100}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="total-points">
                                <span>Expected Total Points:</span>
                                <strong>
                                    {config.sections.objective.count * config.sections.objective.pointsEach +
                                        config.sections.subjective.count * config.sections.subjective.pointsEach +
                                        config.sections.coding.count * config.sections.coding.pointsEach}
                                </strong>
                            </div>
                        </div>

                        <div className="config-section skills-section">
                            <h3>Skills from JD</h3>
                            <div className="skills-list">
                                {extractedSkills.length > 0 ? (
                                    extractedSkills.map((skill: string, idx: number) => (
                                        <span key={idx} className="skill-tag">{skill}</span>
                                    ))
                                ) : (
                                    <p className="no-skills">No skills extracted from JD</p>
                                )}
                            </div>
                        </div>

                        <div className="config-section options-section">
                            <h3>Options</h3>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.shuffleQuestions}
                                    onChange={(e) => setConfig({ ...config, shuffleQuestions: e.target.checked })}
                                />
                                <span>Shuffle questions for each candidate</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.showResults}
                                    onChange={(e) => setConfig({ ...config, showResults: e.target.checked })}
                                />
                                <span>Show results to candidate after completion</span>
                            </label>
                        </div>
                    </div>

                    <div className="generate-section">
                        <button
                            className="btn-generate"
                            onClick={handleGenerateQuestions}
                            disabled={isGenerating}
                        >
                            <Wand2 className={`icon ${isGenerating ? 'spinning' : ''}`} />
                            {isGenerating ? 'Generating Questions...' : 'Auto-Generate Questions with AI'}
                        </button>
                    </div>
                </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
                <div className="tab-content questions-tab">
                    <div className="questions-layout">
                        <div className="questions-sidebar">
                            <div className="add-buttons">
                                <button onClick={() => addQuestion('objective')}>
                                    <CheckSquare className="icon" /> + Objective
                                </button>
                                <button onClick={() => addQuestion('subjective')}>
                                    <FileText className="icon" /> + Subjective
                                </button>
                                <button onClick={() => addQuestion('coding')}>
                                    <Code className="icon" /> + Coding
                                </button>
                            </div>

                            <div className="questions-list">
                                {questions.map((q, index) => (
                                    <div
                                        key={q.id}
                                        className={`question-item ${selectedQuestionId === q.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedQuestionId(q.id)}
                                    >
                                        <GripVertical className="drag-handle" />
                                        <span className="question-number">{index + 1}</span>
                                        <span className={`type-badge ${q.type}`}>
                                            {q.type.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="question-preview">
                                            {q.text.substring(0, 30) || 'Empty question...'}
                                        </span>
                                        <div className="question-actions">
                                            <button onClick={(e) => { e.stopPropagation(); duplicateQuestion(q.id); }}>
                                                <Copy className="icon" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}>
                                                <Trash2 className="icon" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="questions-summary">
                                <span>Objective: {questionsByType.objective}</span>
                                <span>Subjective: {questionsByType.subjective}</span>
                                <span>Coding: {questionsByType.coding}</span>
                                <strong>Total: {totalPoints} pts</strong>
                            </div>
                        </div>

                        <div className="question-editor">
                            {selectedQuestionId ? (
                                <QuestionEditor
                                    question={questions.find(q => q.id === selectedQuestionId)!}
                                    onUpdate={(updates) => updateQuestion(selectedQuestionId, updates)}
                                    availableSkills={extractedSkills}
                                />
                            ) : (
                                <div className="no-selection">
                                    <p>Select a question to edit or add a new one</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div className="tab-content preview-tab">
                    <div className="preview-container">
                        <div className="preview-header">
                            <h3>{config.title}</h3>
                            <p>{config.description}</p>
                            <div className="preview-meta">
                                <span><Clock className="icon" /> {config.duration} mins</span>
                                <span><Target className="icon" /> Pass: {config.passingScore}%</span>
                                <span>{questions.length} Questions • {totalPoints} Points</span>
                            </div>
                        </div>

                        <div className="preview-questions">
                            {questions.map((q, index) => (
                                <div key={q.id} className="preview-question">
                                    <div className="question-header">
                                        <span className="q-number">Q{index + 1}</span>
                                        <span className={`q-type ${q.type}`}>{q.type}</span>
                                        <span className="q-difficulty">{q.difficulty}</span>
                                        <span className="q-points">{q.points} pts</span>
                                    </div>
                                    <p className="q-text">{q.text || 'No question text'}</p>
                                    {q.type === 'objective' && q.options && (
                                        <div className="q-options">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className={`option ${i === q.correctAnswer ? 'correct' : ''}`}>
                                                    {String.fromCharCode(65 + i)}. {opt || 'Empty option'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Question Editor Component
interface QuestionEditorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    availableSkills: string[];
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, availableSkills }) => {
    return (
        <div className="editor-content">
            <div className="editor-header">
                <span className={`type-label ${question.type}`}>
                    {question.type.charAt(0).toUpperCase() + question.type.slice(1)} Question
                </span>
            </div>

            <div className="form-group">
                <label>Question Text</label>
                <textarea
                    value={question.text}
                    onChange={(e) => onUpdate({ text: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={4}
                />
            </div>

            {question.type === 'objective' && (
                <div className="options-editor">
                    <label>Options (select correct answer)</label>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="option-row">
                            <input
                                type="radio"
                                name="correctAnswer"
                                checked={question.correctAnswer === i}
                                onChange={() => onUpdate({ correctAnswer: i })}
                            />
                            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[i] = e.target.value;
                                    onUpdate({ options: newOptions });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {question.type === 'coding' && (
                <div className="test-cases-editor">
                    <label>Test Cases</label>
                    {question.testCases?.map((tc, i) => (
                        <div key={i} className="test-case">
                            <div className="tc-input">
                                <label>Input</label>
                                <input
                                    type="text"
                                    value={tc.input}
                                    onChange={(e) => {
                                        const newTestCases = [...(question.testCases || [])];
                                        newTestCases[i].input = e.target.value;
                                        onUpdate({ testCases: newTestCases });
                                    }}
                                    placeholder="Input value"
                                />
                            </div>
                            <div className="tc-output">
                                <label>Expected Output</label>
                                <input
                                    type="text"
                                    value={tc.output}
                                    onChange={(e) => {
                                        const newTestCases = [...(question.testCases || [])];
                                        newTestCases[i].output = e.target.value;
                                        onUpdate({ testCases: newTestCases });
                                    }}
                                    placeholder="Expected output"
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        className="btn-add-tc"
                        onClick={() => onUpdate({
                            testCases: [...(question.testCases || []), { input: '', output: '' }]
                        })}
                    >
                        <Plus className="icon" /> Add Test Case
                    </button>
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Difficulty</label>
                    <select
                        value={question.difficulty}
                        onChange={(e) => onUpdate({ difficulty: e.target.value as any })}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Points</label>
                    <input
                        type="number"
                        value={question.points}
                        onChange={(e) => onUpdate({ points: parseInt(e.target.value) })}
                        min={1}
                        max={100}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Skills Assessed</label>
                <div className="skills-selector">
                    {availableSkills.map(skill => (
                        <label key={skill} className="skill-checkbox">
                            <input
                                type="checkbox"
                                checked={question.skills.includes(skill)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onUpdate({ skills: [...question.skills, skill] });
                                    } else {
                                        onUpdate({ skills: question.skills.filter(s => s !== skill) });
                                    }
                                }}
                            />
                            <span>{skill}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssessmentBuilder;
