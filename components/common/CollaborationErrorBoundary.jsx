/**
 * =============================================================================
 * COLLABORATION ERROR BOUNDARY
 * =============================================================================
 * 
 * Error boundary specifically for collaboration features to prevent app crashes
 * when WebSocket or collaboration logic fails.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { destroyCollaborationManager } from '../../service/collaborationManager';

class CollaborationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('🚨 [CollaborationErrorBoundary] Caught error:', error);
    console.error('🚨 [CollaborationErrorBoundary] Error info:', errorInfo);

    // Store error details
    this.setState({
      error,
      errorInfo
    });

    // Clean up collaboration manager to prevent further issues
    try {
      destroyCollaborationManager();
      console.log('✅ [CollaborationErrorBoundary] Cleaned up collaboration manager');
    } catch (cleanupError) {
      console.error('❌ [CollaborationErrorBoundary] Cleanup error:', cleanupError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Notify parent component to retry
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleDisableCollaboration = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Notify parent to disable collaboration
    if (this.props.onDisableCollaboration) {
      this.props.onDisableCollaboration();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Icon name="error" size={48} color="#FF6B6B" style={styles.errorIcon} />
            
            <Text style={styles.errorTitle}>Collaboration Error</Text>
            
            <Text style={styles.errorMessage}>
              Something went wrong with the real-time collaboration feature. 
              You can continue using the app without collaboration or try to reconnect.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.retryButton]} 
                onPress={this.handleRetry}
              >
                <Icon name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.continueButton]} 
                onPress={this.handleDisableCollaboration}
              >
                <Icon name="edit" size={20} color="#666" />
                <Text style={styles.continueButtonText}>Continue Solo</Text>
              </TouchableOpacity>
            </View>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  continueButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxWidth: 300,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default CollaborationErrorBoundary;