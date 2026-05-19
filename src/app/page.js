"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const FRAME1_COUNT = 331;
const FRAME2_COUNT = 150;
const FRAME3_COUNT = 600;
const FRAME4_COUNT = 600;
const FRAME5_COUNT = 601;
const FRAME6_COUNT = 601;
const FRAME7_COUNT = 601;
const FRAME8_COUNT = 811;
const TOTAL_FRAMES = FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT + FRAME6_COUNT + FRAME7_COUNT + FRAME8_COUNT;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioRef = useRef(null);

  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const activeFrameRef = useRef(0);

  // Ref for the lerp animation engine
  const currentFrameRef = useRef(0);
  // Refs for 3D mouse parallax
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  // Refs for the UI overlays so we can fade them out instantly without React state overhead
  const titleOverlayRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  // Cinematic text refs
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const text4Ref = useRef(null);

  // Pre-load images on mount
  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();

      let src = "";
      if (i <= FRAME1_COUNT) {
        const pad = String(i).padStart(6, "0");
        src = `/frame1/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT) {
        const frame2Index = i - FRAME1_COUNT;
        const pad = String(frame2Index).padStart(6, "0");
        src = `/frame2/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT) {
        const frame3Index = i - (FRAME1_COUNT + FRAME2_COUNT);
        const pad = String(frame3Index).padStart(6, "0");
        src = `/frame3/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT) {
        const frame4Index = i - (FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT);
        const pad = String(frame4Index).padStart(6, "0");
        src = `/frame4/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT) {
        const frame5Index = i - (FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT);
        const pad = String(frame5Index).padStart(6, "0");
        src = `/frame5/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT + FRAME6_COUNT) {
        const frame6Index = i - (FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT);
        const pad = String(frame6Index).padStart(6, "0");
        src = `/frame6/frame_${pad}.webp`;
      } else if (i <= FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT + FRAME6_COUNT + FRAME7_COUNT) {
        const frame7Index = i - (FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT + FRAME6_COUNT);
        const pad = String(frame7Index).padStart(6, "0");
        src = `/frame7/frame_${pad}.webp`;
      } else {
        const frame8Index = i - (FRAME1_COUNT + FRAME2_COUNT + FRAME3_COUNT + FRAME4_COUNT + FRAME5_COUNT + FRAME6_COUNT + FRAME7_COUNT);
        const pad = String(frame8Index).padStart(6, "0");
        src = `/frame8/frame_${pad}.webp`;
      }

      img.src = src;

      img.onload = () => {
        loadedCount++;
        setLoadedPercentage(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsReady(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
        setLoadedPercentage(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsReady(true);
        }
      };

      images.push(img);
    }
  }, []);

  // Smooth Scroll (Lenis) & Lerp Engine setup
  useEffect(() => {
    if (!hasEntered) return;

    const lenis = new Lenis({
      lerp: 0.08, // Optimal lerp for visual syncing
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    // 3D Parallax Mouse Tracking
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      targetMouseRef.current = { x, y };
    };
    window.addEventListener("mousemove", handleMouseMove);

    function raf(time) {
      lenis.raf(time);

      // Compute target frame based on current physical scroll position
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);

      const scrollFraction = scrollTop / maxScroll;

      // Update UI Overlays opacity instantly for perfect fade out
      const calculatedOpacity = Math.max(0, 1 - scrollFraction * 10);
      if (titleOverlayRef.current) {
        titleOverlayRef.current.style.opacity = calculatedOpacity;
        titleOverlayRef.current.style.transform = `translate(-50%, calc(-50% - ${scrollFraction * 200}px))`;
      }
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity = calculatedOpacity;
      }

      // Cinematic text animations
      const updateCinematicText = (element, start, end) => {
        if (!element) return;
        const progress = (scrollFraction - start) / (end - start);
        if (progress < 0) {
          element.style.opacity = 0;
          element.style.transform = "translate(-50%, 50px) scale(0.95)";
        } else if (progress > 1) {
          element.style.opacity = 0;
          element.style.transform = "translate(-50%, -50px) scale(1.05)";
        } else {
          // fade in for first 20%, hold, fade out for last 20%
          let opacity = 1;
          if (progress < 0.2) opacity = progress / 0.2;
          else if (progress > 0.8) opacity = (1 - progress) / 0.2;

          const yOffset = 50 - (progress * 100); // 50 to -50
          const scale = 0.95 + (progress * 0.1); // 0.95 to 1.05

          element.style.opacity = opacity;
          element.style.transform = `translate(-50%, ${yOffset}px) scale(${scale})`;
        }
      };

      updateCinematicText(text1Ref.current, 0.1, 0.25);
      updateCinematicText(text2Ref.current, 0.35, 0.5);
      updateCinematicText(text3Ref.current, 0.6, 0.75);
      updateCinematicText(text4Ref.current, 0.8, 0.95);

      const targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

      // Directly sync frame to Lenis smooth scroll position without artificial catch-up delay.
      // This ensures frames ONLY change while actively scrolling.
      currentFrameRef.current = targetFrame;

      const frameToRender = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current)));

      if (activeFrameRef.current !== frameToRender) {
        activeFrameRef.current = frameToRender;
        renderFrame(frameToRender);
      }

      // Smooth 3D Mouse Panning Effect
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      if (canvasRef.current) {
        // Scale to 1.05 to hide the edges while panning 30px max
        canvasRef.current.style.transform = `translate(${mouseRef.current.x * -30}px, ${mouseRef.current.y * -30}px) scale(1.05)`;
      }

      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleResize = () => {
      renderFrame(activeFrameRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hasEntered]);

  const handleEnter = () => {
    setIsLoading(false);
    setHasEntered(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio autoplay failed:", e));
      setIsAudioPlaying(true);
    }
    requestAnimationFrame(() => renderFrame(0));
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
    }
  };

  // Canvas drawing cover fit function
  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    // Set canvas dimensions to viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const w = canvas.width;
    const h = canvas.height;

    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;

    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = w;
      drawHeight = w / imgRatio;
      drawX = 0;
      drawY = (h - drawHeight) / 2;
    } else {
      drawWidth = h * imgRatio;
      drawHeight = h;
      drawX = (w - drawWidth) / 2;
      drawY = 0;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  return (
    <>
      {/* Audio Element - Requires a theme.mp3 in the public folder */}
      <audio ref={audioRef} src="/theme.mp3" loop />

      {hasEntered && (
        <button
          onClick={toggleAudio}
          style={{
            position: "fixed",
            top: "30px",
            right: "30px",
            zIndex: 50,
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#fff",
            backdropFilter: "blur(5px)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(0, 168, 204, 0.2)";
            e.currentTarget.style.borderColor = "rgba(0, 168, 204, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          {isAudioPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          )}
        </button>
      )}

      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#030811",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "40vw",
              height: "40vw",
              background: "radial-gradient(circle, rgba(0, 168, 204, 0.2) 0%, rgba(0,0,0,0) 70%)",
              filter: "blur(60px)",
              top: "20%",
              left: "30%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: "300",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "#8ce4ff",
                marginBottom: "30px",
                textShadow: "0 0 10px rgba(0, 168, 204, 0.4)",
              }}
            >
              AVATAR
            </h2>

            <div
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid rgba(0, 168, 204, 0.1)",
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#00a8cc",
                  position: "absolute",
                  animation: "spin 1.5s linear infinite",
                  boxShadow: "0 -2px 10px rgba(0, 168, 204, 0.4)",
                  display: isReady ? "none" : "block",
                }}
              />
              {!isReady ? (
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    fontFamily: "monospace",
                    color: "#ffffff",
                  }}
                >
                  {loadedPercentage}%
                </span>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a8cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </div>

            {isReady ? (
              <button
                onClick={handleEnter}
                style={{
                  marginTop: "35px",
                  background: "transparent",
                  border: "1px solid rgba(0, 168, 204, 0.5)",
                  color: "#00a8cc",
                  padding: "12px 30px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  borderRadius: "30px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 0 15px rgba(0, 168, 204, 0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(0, 168, 204, 0.1)";
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(0, 168, 204, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 168, 204, 0.1)";
                }}
              >
                Enter Pandora
              </button>
            ) : (
              <p
                style={{
                  marginTop: "25px",
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  color: "#718b9b",
                  textTransform: "uppercase",
                }}
              >
                Synchronizing Neural Link
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas Scroll Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          // Increased height drastically to give more physical scroll space per frame
          // This naturally prevents skipping during standard mouse wheel scrolls
          height: "2500vh",
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>

        {/* Cinematic Title Overlay that fades on scroll */}
        <div
          ref={titleOverlayRef}
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
            opacity: 1,
            // no CSS transition needed since JS raf lerps it instantly without jank
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "300",
              letterSpacing: "0.2em",
              color: "#ffffff",
              margin: 0,
              textTransform: "uppercase",
              textShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            }}
          >
            AVATAR
          </h1>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "400",
              letterSpacing: "0.4em",
              color: "#8ce4ff",
              margin: "10px 0 0 0",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(0, 168, 204, 0.6)",
            }}
          >
            The Way of Water
          </h2>
        </div>

        {/* Cinematic Texts */}
        <div
          ref={text1Ref}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 50px) scale(0.95)",
            opacity: 0,
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
            width: "80%",
            maxWidth: "800px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h3 style={{
            fontSize: "2.5rem",
            fontWeight: "200",
            letterSpacing: "0.15em",
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 5px 20px rgba(0,0,0,0.8)",
            margin: 0
          }}>
            Return to Pandora
          </h3>
          <p style={{
            marginTop: "1rem",
            fontSize: "1.1rem",
            color: "#8ce4ff",
            letterSpacing: "0.1em",
            fontWeight: "300",
            textShadow: "0 2px 10px rgba(0, 168, 204, 0.4)",
          }}>
            A decade after the events of the first film, the journey continues.
          </p>
        </div>

        <div
          ref={text2Ref}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 50px) scale(0.95)",
            opacity: 0,
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
            width: "80%",
            maxWidth: "800px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h3 style={{
            fontSize: "2.5rem",
            fontWeight: "200",
            letterSpacing: "0.15em",
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 5px 20px rgba(0,0,0,0.8)",
            margin: 0
          }}>
            The Sully Family
          </h3>
          <p style={{
            marginTop: "1rem",
            fontSize: "1.1rem",
            color: "#8ce4ff",
            letterSpacing: "0.1em",
            fontWeight: "300",
            textShadow: "0 2px 10px rgba(0, 168, 204, 0.4)",
          }}>
            Discover the trouble that follows them, and the lengths they go to keep each other safe.
          </p>
        </div>

        <div
          ref={text3Ref}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 50px) scale(0.95)",
            opacity: 0,
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
            width: "80%",
            maxWidth: "800px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h3 style={{
            fontSize: "2.5rem",
            fontWeight: "200",
            letterSpacing: "0.15em",
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 5px 20px rgba(0,0,0,0.8)",
            margin: 0
          }}>
            Explore the Oceans
          </h3>
          <p style={{
            marginTop: "1rem",
            fontSize: "1.1rem",
            color: "#8ce4ff",
            letterSpacing: "0.1em",
            fontWeight: "300",
            textShadow: "0 2px 10px rgba(0, 168, 204, 0.4)",
          }}>
            Dive into the unseen depths and uncharted waters of a stunning new biome.
          </p>
        </div>

        <div
          ref={text4Ref}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 50px) scale(0.95)",
            opacity: 0,
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
            width: "80%",
            maxWidth: "800px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h3 style={{
            fontSize: "3.5rem",
            fontWeight: "300",
            letterSpacing: "0.2em",
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 10px 30px rgba(0,0,0,0.8)",
            margin: 0
          }}>
            Breathe
          </h3>
          <p style={{
            marginTop: "1rem",
            fontSize: "1.2rem",
            color: "#8ce4ff",
            letterSpacing: "0.3em",
            fontWeight: "400",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0, 168, 204, 0.4)",
          }}>
            The Way of Water connects all things.
          </p>
        </div>

        {/* Elegant Minimalist Overlay (Scroll indicator) that fades on scroll */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            zIndex: 10,
            pointerEvents: "none",
            opacity: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.4)",
              fontWeight: "400",
            }}
          >
            SCROLL TO IMMERSE
          </span>
          <div
            style={{
              width: "20px",
              height: "35px",
              borderRadius: "10px",
              border: "1.5px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "8px",
                backgroundColor: "#00a8cc",
                borderRadius: "2px",
                marginTop: "6px",
                animation: "scrollPulse 2s infinite ease-in-out",
                boxShadow: "0 0 6px #00a8cc",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
