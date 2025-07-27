import { useState, useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll({
  hasNextPage = true,
  fetchNextPage,
  threshold = 1.0,
  rootMargin = '0px'
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (isFetching || !hasNextPage) return;

    try {
      setIsFetching(true);
      setError(null);
      await fetchNextPage();
    } catch (err) {
      setError(err);
      console.error('Error loading more items:', err);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetching) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(target);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetching, loadMore, threshold, rootMargin]);

  return {
    targetRef,
    isFetching,
    error,
    loadMore
  };
}

// Hook for lazy loading images
export function useLazyImage(src, options = {}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setIsError(true);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError
  };
}
