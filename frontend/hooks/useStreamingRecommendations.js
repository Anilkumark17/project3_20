import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for consuming Server-Sent Events (SSE) recommendations stream
 * Provides progressive loading with immediate rule-based results + AI enhancement
 */
export const useStreamingRecommendations = (clerkId, options = {}) => {
  const { enabled = true, onComplete, onError } = options;
  
  const [phase, setPhase] = useState('idle'); // idle, rule-based, ai-reranking, complete
  const [ruleBasedRecommendations, setRuleBasedRecommendations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [finalRecommendations, setFinalRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  const eventSourceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const startStream = useCallback(() => {
    if (!clerkId || !enabled) return;

    // Cleanup previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);
    setPhase('connecting');
    setProgress(0);
    setRuleBasedRecommendations([]);
    setAiRecommendations([]);
    setFinalRecommendations([]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const url = `${apiUrl}/recommendations/${clerkId}/stream`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Phase updates
    eventSource.addEventListener('phase', (event) => {
      const data = JSON.parse(event.data);
      setPhase(data.phase);
      setMessage(data.message);
      console.log('[SSE] Phase:', data.phase, data.message);
    });

    // Rule-based recommendations (immediate)
    eventSource.addEventListener('rule-based', (event) => {
      const data = JSON.parse(event.data);
      setRuleBasedRecommendations(data.recommendations);
      setProgress(30); // 30% complete after rule-based
      console.log('[SSE] Rule-based recommendations:', data.count);
    });

    // AI chunk (progressive)
    eventSource.addEventListener('ai-chunk', (event) => {
      const data = JSON.parse(event.data);
      setAiRecommendations(prev => {
        const updated = [...prev];
        updated[data.index] = data.course;
        return updated;
      });
      setProgress(30 + (data.progress * 0.6)); // 30-90% during AI
      console.log('[SSE] AI chunk:', data.index + 1, '/', data.total);
    });

    // Complete recommendations
    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      setFinalRecommendations(data.recommendations);
      setProgress(100);
      console.log('[SSE] Complete:', data.recommendations.length, 'recommendations');
      
      if (onComplete) {
        onComplete(data.recommendations);
      }
    });

    // Stream done
    eventSource.addEventListener('done', (event) => {
      const data = JSON.parse(event.data);
      console.log('[SSE] Stream complete:', data.message);
      setIsLoading(false);
      setPhase('complete');
      eventSource.close();
    });

    // Error handling
    eventSource.addEventListener('error', (event) => {
      let errorData = { error: 'Stream error', message: 'Connection failed' };
      
      try {
        errorData = JSON.parse(event.data);
      } catch (e) {
        // If parsing fails, use default error
      }
      
      console.error('[SSE] Error:', errorData);
      setError(errorData.message || 'Failed to stream recommendations');
      setIsLoading(false);
      setPhase('error');
      
      if (onError) {
        onError(errorData);
      }
      
      eventSource.close();
    });

    // Connection error
    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      
      // Only set error if we haven't completed successfully
      if (phase !== 'complete') {
        setError('Connection lost. Please try again.');
        setIsLoading(false);
        setPhase('error');
        
        if (onError) {
          onError({ error: 'Connection error', message: 'Stream connection lost' });
        }
      }
      
      eventSource.close();
    };

  }, [clerkId, enabled, onComplete, onError, phase]);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    startStream();
  }, [startStream]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (enabled && clerkId) {
      startStream();
    }

    return () => {
      stopStream();
    };
  }, [clerkId, enabled]); // Only re-run if clerkId or enabled changes

  // Get current recommendations based on phase
  const currentRecommendations = 
    phase === 'complete' ? finalRecommendations :
    phase === 'ai-reranking' && aiRecommendations.length > 0 ? aiRecommendations :
    ruleBasedRecommendations;

  return {
    // State
    phase,
    isLoading,
    error,
    message,
    progress,
    
    // Recommendations at different stages
    ruleBasedRecommendations,
    aiRecommendations,
    finalRecommendations,
    currentRecommendations,
    
    // Actions
    startStream,
    stopStream,
    retry,
  };
};

export default useStreamingRecommendations;
