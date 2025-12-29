/**
 * Tool Testing Page
 * Test AI tool execution with visual indicators
 */

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, Card, Heading, Body, Button, Caption } from '@/design-system';
import { useAIChatStream, ToolExecution } from '@/hooks/useAIChatStream';
import ToolExecutionIndicator from '@/components/features/ai-chat/ToolExecutionIndicator';

export default function ToolTestingScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState('');

  const {
    sendStreamingMessage,
    streamingContent,
    isStreaming,
    error,
    toolExecutions,
    currentTool,
  } = useAIChatStream();

  // Preset test messages that should trigger tools
  const presetTests = [
    {
      label: 'Update Identity Document',
      message:
        'Update my identity document: I am Jack, the God Builder. My traits are: ambitious, innovative, consistent. My archetype is The World Changer.',
      description: 'Should invoke modify_identity_document tool',
    },
    {
      label: 'Search Goals',
      message: 'What are my current goals?',
      description: 'May invoke search_goals tool (if implemented)',
    },
    {
      label: 'General Chat',
      message: 'Hello, how can you help me today?',
      description: 'Should NOT invoke tools (regular chat)',
    },
  ];

  const handleSendTest = async (message: string) => {
    try {
      setResponse('');
      await sendStreamingMessage(message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send test message');
    }
  };

  // Update response as content streams
  React.useEffect(() => {
    if (streamingContent) {
      setResponse(streamingContent);
    }
  }, [streamingContent]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] }}>
          <Button variant="ghost" onPress={() => router.back()} style={{ marginRight: spacing[3] }}>
            Back
          </Button>
          <Heading variant="displayLg" style={{ color: colors.text.primary }}>
            Tool Testing
          </Heading>
        </View>

        {/* Info */}
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Body style={{ color: colors.text.secondary }}>
            Test AI tool execution with visual feedback. Messages that require tools will show
            real-time indicators below.
          </Body>
        </Card>

        {/* Preset Tests */}
        <Heading variant="displayMd" style={{ color: colors.text.primary, marginBottom: spacing[3] }}>
          Preset Tests
        </Heading>
        {presetTests.map((test, index) => (
          <Card key={index} variant="default" style={{ marginBottom: spacing[3] }}>
            <Heading variant="displaySm" style={{ color: colors.text.primary }}>
              {test.label}
            </Heading>
            <Caption style={{ color: colors.text.muted, marginVertical: spacing[2] }}>
              {test.description}
            </Caption>
            <Body
              style={{
                color: colors.text.secondary,
                backgroundColor: colors.background.secondary,
                padding: spacing[2],
                borderRadius: 6,
                fontFamily: 'monospace',
                marginBottom: spacing[3],
              }}
            >
              {test.message}
            </Body>
            <Button
              variant="primary"
              onPress={() => handleSendTest(test.message)}
              disabled={isStreaming}
            >
              {isStreaming ? 'Sending...' : 'Send Test'}
            </Button>
          </Card>
        ))}

        {/* Custom Test */}
        <Heading variant="displayMd" style={{ color: colors.text.primary, marginBottom: spacing[3] }}>
          Custom Test
        </Heading>
        <Card variant="default" style={{ marginBottom: spacing[4] }}>
          <Caption style={{ color: colors.text.muted, marginBottom: spacing[2] }}>
            Enter your own test message:
          </Caption>
          <TextInput
            value={testMessage}
            onChangeText={setTestMessage}
            placeholder="Type a message to test..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              padding: spacing[3],
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border.muted,
              marginBottom: spacing[3],
              fontSize: 14,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
          <Button
            variant="secondary"
            onPress={() => handleSendTest(testMessage)}
            disabled={isStreaming || !testMessage.trim()}
          >
            {isStreaming ? 'Sending...' : 'Send Custom Test'}
          </Button>
        </Card>

        {/* Tool Execution Status */}
        {(currentTool || toolExecutions.length > 0) && (
          <>
            <Heading
              variant="displayMd"
              style={{ color: colors.text.primary, marginBottom: spacing[3] }}
            >
              Tool Execution Status
            </Heading>

            <Card variant="default" style={{ marginBottom: spacing[4] }}>
              {/* Current Tool (if executing) */}
              {currentTool && (
                <View style={{ marginBottom: spacing[3] }}>
                  <Caption
                    style={{ color: colors.accent.info, fontWeight: '600', marginBottom: spacing[2] }}
                  >
                    Currently Executing:
                  </Caption>
                  <ToolExecutionIndicator toolExecution={currentTool} />
                </View>
              )}

              {/* Completed Tool Executions */}
              {toolExecutions.length > 0 && (
                <View>
                  <Caption
                    style={{ color: colors.text.muted, fontWeight: '600', marginBottom: spacing[2] }}
                  >
                    Tool Execution History ({toolExecutions.length}):
                  </Caption>
                  {toolExecutions.map((tool, index) => (
                    <ToolExecutionIndicator key={index} toolExecution={tool} />
                  ))}
                </View>
              )}
            </Card>
          </>
        )}

        {/* Response Display */}
        {(response || error) && (
          <>
            <Heading
              variant="displayMd"
              style={{ color: colors.text.primary, marginBottom: spacing[3] }}
            >
              AI Response
            </Heading>
            <Card variant="default" style={{ marginBottom: spacing[4] }}>
              {error ? (
                <Body style={{ color: colors.accent.error }}>{error}</Body>
              ) : (
                <>
                  {isStreaming && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[2] }}>
                      <ActivityIndicator size="small" color={colors.accent.info} />
                      <Caption style={{ color: colors.accent.info, marginLeft: spacing[2] }}>
                        Streaming...
                      </Caption>
                    </View>
                  )}
                  <Body style={{ color: colors.text.primary }}>{response}</Body>
                </>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
