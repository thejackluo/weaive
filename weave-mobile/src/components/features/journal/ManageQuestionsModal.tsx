/**
 * Story 4.1b: Manage Custom Questions Modal
 *
 * Full-screen modal for CRUD operations on custom reflection questions
 *
 * Features (AC #11-#12):
 * - List existing questions
 * - Add new question with type selector
 * - Edit existing questions
 * - Delete with confirmation
 * - Max 5 questions limit
 * - Example prompts for first question
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { CustomQuestion, CustomQuestionType } from './CustomQuestionInput';

interface ManageQuestionsModalProps {
  visible: boolean;
  questions: CustomQuestion[];
  onClose: () => void;
  onSave: (questions: CustomQuestion[]) => void;
}

// Example questions (AC #12)
const EXAMPLE_QUESTIONS = [
  { question: 'Did I stick to my diet?', type: 'yes_no' as CustomQuestionType },
  { question: 'How many pages did I read?', type: 'numeric' as CustomQuestionType },
  { question: 'Rate my energy level (1-10)', type: 'numeric' as CustomQuestionType },
  { question: 'Did I exercise today?', type: 'yes_no' as CustomQuestionType },
  { question: 'What was my biggest win today?', type: 'text' as CustomQuestionType },
];

export default function ManageQuestionsModal({
  visible,
  questions,
  onClose,
  onSave,
}: ManageQuestionsModalProps) {
  const [localQuestions, setLocalQuestions] = useState<CustomQuestion[]>(questions);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  // Add question form state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<CustomQuestionType>('text');

  const handleAddQuestion = () => {
    if (localQuestions.length >= 5) {
      Alert.alert('Limit Reached', 'You can track up to 5 custom questions.');
      return;
    }

    if (localQuestions.length === 0) {
      // Show examples for first question
      setShowExamples(true);
    }

    setIsAddingQuestion(true);
  };

  const handleSaveNewQuestion = () => {
    if (!newQuestionText.trim() || newQuestionText.length < 10) {
      Alert.alert('Invalid Question', 'Question must be at least 10 characters.');
      return;
    }

    const newQuestion: CustomQuestion = {
      id: `custom-${Date.now()}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      created_at: new Date().toISOString(),
    };

    setLocalQuestions([...localQuestions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setIsAddingQuestion(false);
    setShowExamples(false);
  };

  const handleSelectExample = (example: { question: string; type: CustomQuestionType }) => {
    setNewQuestionText(example.question);
    setNewQuestionType(example.type);
    setShowExamples(false);
  };

  const handleEditQuestion = (questionId: string) => {
    const question = localQuestions.find((q) => q.id === questionId);
    if (question) {
      setEditingQuestionId(questionId);
      setNewQuestionText(question.question);
      setNewQuestionType(question.type);
      setIsAddingQuestion(true);
    }
  };

  const handleUpdateQuestion = () => {
    if (!newQuestionText.trim() || newQuestionText.length < 10) {
      Alert.alert('Invalid Question', 'Question must be at least 10 characters.');
      return;
    }

    setLocalQuestions(
      localQuestions.map((q) =>
        q.id === editingQuestionId
          ? { ...q, question: newQuestionText.trim(), type: newQuestionType }
          : q
      )
    );

    setEditingQuestionId(null);
    setNewQuestionText('');
    setNewQuestionType('text');
    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const question = localQuestions.find((q) => q.id === questionId);
    Alert.alert(
      'Delete Question',
      `Delete "${question?.question}"?\n\nPast responses will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLocalQuestions(localQuestions.filter((q) => q.id !== questionId));
          },
        },
      ]
    );
  };

  const handleSaveAll = () => {
    onSave(localQuestions);
    onClose();
  };

  const handleCancel = () => {
    setLocalQuestions(questions); // Reset to original
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    setNewQuestionText('');
    setShowExamples(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Custom Questions</Text>
          <TouchableOpacity onPress={handleSaveAll}>
            <Text style={[styles.headerButton, styles.headerButtonPrimary]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Info */}
          <Text style={styles.infoText}>
            Track what matters to you. Add up to 5 custom questions to your daily reflection.
          </Text>

          {/* Existing Questions List */}
          {localQuestions.length > 0 && (
            <View style={styles.questionsList}>
              <Text style={styles.sectionTitle}>Your Questions ({localQuestions.length}/5)</Text>
              {localQuestions.map((question) => (
                <View key={question.id} style={styles.questionItem}>
                  <View style={styles.questionItemContent}>
                    <Text style={styles.questionItemText}>{question.question}</Text>
                    <Text style={styles.questionItemType}>
                      {question.type === 'text' && 'Text'}
                      {question.type === 'numeric' && 'Numeric (1-10)'}
                      {question.type === 'yes_no' && 'Yes/No'}
                    </Text>
                  </View>
                  <View style={styles.questionItemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditQuestion(question.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteQuestion(question.id)}
                      style={[styles.actionButton, styles.actionButtonDelete]}
                    >
                      <Text style={[styles.actionButtonText, styles.actionButtonDeleteText]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add/Edit Question Form */}
          {isAddingQuestion ? (
            <View style={styles.addForm}>
              <Text style={styles.sectionTitle}>
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </Text>

              <Text style={styles.inputLabel}>Question Text</Text>
              <TextInput
                style={styles.textInput}
                value={newQuestionText}
                onChangeText={setNewQuestionText}
                placeholder="e.g., Did I stick to my diet?"
                placeholderTextColor="#999"
                maxLength={100}
                autoFocus
              />
              <Text style={styles.characterCount}>{newQuestionText.length} / 100</Text>

              <Text style={styles.inputLabel}>Question Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, newQuestionType === 'text' && styles.typeButtonActive]}
                  onPress={() => setNewQuestionType('text')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newQuestionType === 'text' && styles.typeButtonTextActive,
                    ]}
                  >
                    Text
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newQuestionType === 'numeric' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewQuestionType('numeric')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newQuestionType === 'numeric' && styles.typeButtonTextActive,
                    ]}
                  >
                    Numeric
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newQuestionType === 'yes_no' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewQuestionType('yes_no')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newQuestionType === 'yes_no' && styles.typeButtonTextActive,
                    ]}
                  >
                    Yes/No
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonSecondary]}
                  onPress={() => {
                    setIsAddingQuestion(false);
                    setEditingQuestionId(null);
                    setNewQuestionText('');
                    setShowExamples(false);
                  }}
                >
                  <Text style={styles.formButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonPrimary]}
                  onPress={editingQuestionId ? handleUpdateQuestion : handleSaveNewQuestion}
                >
                  <Text style={styles.formButtonPrimaryText}>
                    {editingQuestionId ? 'Update' : 'Add Question'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddQuestion}
              disabled={localQuestions.length >= 5}
            >
              <Text style={styles.addButtonText}>
                {localQuestions.length >= 5
                  ? '✓ Maximum Questions Reached'
                  : '+ Add Custom Question'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Example Questions (shown for first question) */}
          {showExamples && (
            <View style={styles.examplesContainer}>
              <Text style={styles.sectionTitle}>Example Questions</Text>
              <Text style={styles.examplesSubtitle}>Tap to use, or write your own above</Text>
              {EXAMPLE_QUESTIONS.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleSelectExample(example)}
                >
                  <Text style={styles.exampleItemText}>{example.question}</Text>
                  <Text style={styles.exampleItemType}>
                    {example.type === 'text' && 'Text'}
                    {example.type === 'numeric' && 'Numeric'}
                    {example.type === 'yes_no' && 'Yes/No'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerButton: {
    fontSize: 16,
    color: '#fff',
  },
  headerButtonPrimary: {
    fontWeight: '600',
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  questionsList: {
    marginBottom: 24,
  },
  questionItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  questionItemContent: {
    marginBottom: 12,
  },
  questionItemText: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 6,
  },
  questionItemType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  questionItemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  actionButtonDelete: {
    backgroundColor: '#7f1d1d',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonDeleteText: {
    color: '#fca5a5',
  },
  addForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonSecondary: {
    backgroundColor: '#2a2a2a',
  },
  formButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  formButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  formButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  examplesContainer: {
    marginTop: 24,
  },
  examplesSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exampleItemText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  exampleItemType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
