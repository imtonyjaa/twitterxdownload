'use client';

import { useEffect, useRef, useState } from 'react';

export default function LazyVideo({ src, poster, ...rest }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);            // 触发渲染真实 source
          node.load();               // 加载资源
          observer.disconnect();     // 一次就够了
        }
      },
      { threshold: 0.25 }            // 25% 进入视口时触发
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      poster={poster}
      preload="none"
      controls
      {...rest}
    >
      {ready && <source src={src} type="video/mp4" />}
      {/* 其他格式可按需追加 */}
    </video>
  );
}