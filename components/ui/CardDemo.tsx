"use client";
import { animate, motion, useScroll, useTransform } from "motion/react";
import React, { useEffect, useState, useRef  } from "react";
import { cn } from "@/lib/utils";
import {

  FaReact, 
  FaNodeJs, 
  FaPython, 
  FaJava, 
  FaGitAlt,
  FaHtml5,
  FaCss3Alt,
  FaAws
} from "react-icons/fa";
import { 

  SiTypescript, 
  SiJavascript, 
  SiNextdotjs, 
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiXcode,
  SiSupabase,
  SiMysql,
  SiSelenium,
  SiFlask,
  SiPandas,
  SiGooglegemini,
  SiScikitlearn,
  SiNumpy,
  SiScipy,
  SiTensorflow,
  SiN8N,
  SiFigma,
  SiNotion,
  SiHuggingface,
  SiVercel,
  SiHubspot,
  SiDocker,
  SiAuth0

} from "react-icons/si";

import {
  DiTerminal,
  DiGoogleDrive,
  DiFirebase,
  DiSwift,
} from "react-icons/di";

import {
  VscVscode

} from "react-icons/vsc";

import { 
  TbSql 

} from "react-icons/tb";

import {
  Bs4CircleFill

} from "react-icons/bs";

import { GoCopilot } from "react-icons/go";

// Skills data shared between mobile and desktop views
const skills = [
  { logo: FaReact, name: "React", link: "https://reactjs.org/" },
  { logo: FaNodeJs, name: "Node.js", link: "https://nodejs.org/" },
  { logo: FaPython, name: "Python", link: "https://www.python.org/" },
  { logo: FaJava, name: "Java", link: "https://www.java.com/" },
  { logo: SiTypescript, name: "TypeScript", link: "https://www.typescriptlang.org/" },
  { logo: SiJavascript, name: "JavaScript", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  { logo: SiNextdotjs, name: "Next.js", link: "https://nextjs.org/" },
  { logo: SiTailwindcss, name: "Tailwind", link: "https://tailwindcss.com/" },
  { logo: SiMongodb, name: "MongoDB", link: "https://www.mongodb.com/" },
  { logo: SiPostgresql, name: "PostgreSQL", link: "https://www.postgresql.org/" },
  { logo: DiSwift, name: "Swift", link: "https://swift.org/" },
  { logo: DiFirebase, name: "Firebase", link: "https://firebase.google.com/" },
  { logo: VscVscode, name: "VSCode", link: "https://code.visualstudio.com/" },
  { logo: SiXcode, name: "XCode", link: "https://developer.apple.com/xcode/" },
  { logo: FaHtml5, name: "HTML5", link: "https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5" },
  { logo: FaCss3Alt, name: "CSS", link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
  { logo: GoCopilot, name: "Copilot", link: "https://copilot.github.com/" },
  { logo: SiSupabase, name: "Supabase", link: "https://supabase.com/" },
  { logo: TbSql, name: "SQL", link: "https://en.wikipedia.org/wiki/SQL" },
  { logo: SiMysql, name: "MySQL", link: "https://www.mysql.com/" },
  { logo: SiSelenium, name: "Selenium", link: "https://www.selenium.dev/" },
  { logo: SiFlask, name: "Flask", link: "https://flask.palletsprojects.com/" },
  { logo: Bs4CircleFill, name: "Bs4", link: "https://pypi.org/project/beautifulsoup4/" },
  { logo: SiPandas, name: "Pandas", link: "https://pandas.pydata.org/" },
  { logo: SiGooglegemini, name: "Gemini", link: "https://ai.googleblog.com/2024/10/introducing-gemini-1-5-next-step-toward.html" },
  { logo: SiScikitlearn, name: "Scikit-learn", link: "https://scikit-learn.org/" },
  { logo: SiNumpy, name: "NumPy", link: "https://numpy.org/" },
  { logo: SiScipy, name: "SciPy", link: "https://scipy.org/" },
  { logo: SiTensorflow, name: "TensorFlow", link: "https://www.tensorflow.org/" },
  { logo: SiN8N, name: "N8N", link: "https://n8n.io/" },
  { logo: SiFigma, name: "Figma", link: "https://www.figma.com/" },
  { logo: SiNotion, name: "Notion", link: "https://www.notion.so/" },
  { logo: SiHuggingface, name: "Huggingface", link: "https://huggingface.co/" },
  { logo: SiVercel, name: "Vercel", link: "https://vercel.com/" },
  { logo: SiHubspot, name: "Hubspot", link: "https://www.hubspot.com/" },
  { logo: SiDocker, name: "Docker", link: "https://www.docker.com/" },
  { logo: SiAuth0, name: "Auth0", link: "https://auth0.com/" },
  { logo: FaAws, name: "AWS", link: "https://aws.amazon.com/" },
];

type CardDemoProps = {
    SkillName?: string | number | undefined;
    Description?: string;
    logo?: React.ComponentType<{ className?: string }>;
};

// Hook to detect if we're on mobile/tablet
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function CardDemo({}: CardDemoProps) {
  const isMobile = useIsMobile();

  return isMobile ? <MobileSkillsGrid /> : <DesktopCarousel />;
}

// Mobile/Tablet Grid Layout
const MobileSkillsGrid = () => {
  return (
    <section className="px-4 py-8">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {skills.map((skill, index) => {
          const LogoComponent = skill.logo;
          return (
            <motion.a
              key={`${skill.name}-${index}`}
              href={skill.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[rgba(248,248,248,0.02)] border border-white/10 hover:border-white/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.95 }}
            >
              <LogoComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
              <span className="text-Beige/70 text-[10px] sm:text-xs text-center leading-tight">
                {skill.name}
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
};

// Desktop Horizontal Scroll Carousel (existing logic)
const DesktopCarousel = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(false);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [headerOffsetTop, setHeaderOffsetTop] = useState(0);
  const [experienceOffsetTop, setExperienceOffsetTop] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false)
  const [carouselCompleted, setCarouselCompleted] = useState(false);

  useEffect(() => {
    // Get skills header and experience section positions on mount
    const skillsHeader = document.getElementById('skills');
    const experienceSection = document.getElementById('experience');
    const navbar = document.querySelector('nav');
    
    if (skillsHeader) {
      setHeaderOffsetTop(skillsHeader.offsetTop);
    }
    if (experienceSection) {
      setExperienceOffsetTop(experienceSection.offsetTop);
    }
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }
    
    setLastScrollY(window.scrollY);
  }, []);

  const handleCarouselComplete = async () => {
    setIsCarouselActive(false);
    setIsResetting(true);
    setHasCompletedOnce(true);
    setCarouselCompleted(true);
    
    try {
      // Animate carousel back to start over 2 seconds with ease-out
      await animate(carouselProgress, 0, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => setCarouselProgress(latest),
      });
      
      // Critical: Reset ALL states and restore interaction IMMEDIATELY
      setIsResetting(false);
      setIsCarouselActive(false);
      
      // Force restore all document styles
      document.body.style.cssText = document.body.style.cssText.replace(/overflow[^;]*;?/g, '');
      document.body.style.cssText = document.body.style.cssText.replace(/pointer-events[^;]*;?/g, '');
      
      // Smooth transition to Experience section
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        setTimeout(() => {
          experienceSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 200);
      }
    } catch (error) {
      // Comprehensive fallback cleanup
      console.warn('Carousel animation failed:', error);
      setCarouselProgress(0);
      setIsResetting(false);
      setIsCarouselActive(false);
      
      // Force restore all document styles
      document.body.style.cssText = document.body.style.cssText.replace(/overflow[^;]*;?/g, '');
      document.body.style.cssText = document.body.style.cssText.replace(/pointer-events[^;]*;?/g, '');
    }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Don't allow scroll events during reset
      if (isResetting) return;
      
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      // Calculate the actual trigger point accounting for navbar height
      const adjustedHeaderTop = headerOffsetTop - navbarHeight - 75; // 50px buffer
      const skillsCarouselZone = headerOffsetTop + 200; // Carousel zone ends 200px after skills header
      
      // Only activate carousel if:
      // 1. Scrolling DOWN only (never on scroll up)
      // 2. We're in the skills section trigger zone (accounting for navbar)
      // 3. We're not past the carousel interaction zone
      // 4. Carousel is not already active or resetting
      // 5. Carousel is at start position
      // 6. We haven't moved too far past the skills section
      if (isScrollingDown && 
          currentScrollY >= adjustedHeaderTop && 
          currentScrollY < skillsCarouselZone &&
          !isCarouselActive &&
          !isResetting &&
          headerOffsetTop > 0 &&
          carouselProgress === 0 &&
          !carouselCompleted) {
        setIsCarouselActive(true);
        document.body.style.overflow = 'hidden';
      }
      
      // Reset carousel completed flag if user scrolls back above the skills section
      if (currentScrollY < adjustedHeaderTop && carouselCompleted) {
        setCarouselCompleted(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleWheel = (e: WheelEvent) => {
      // Only block wheel events during carousel interaction, NOT during reset
      if (isCarouselActive && !isResetting) {
        e.preventDefault();
        
        const scrollSpeed = 0.001;
        const newProgress = Math.max(0, Math.min(1, carouselProgress + (e.deltaY * scrollSpeed)));
        setCarouselProgress(newProgress);
        
        // Trigger reset animation when carousel completes
        if (newProgress >= 1) {
          handleCarouselComplete();
        }
      }
      // Allow normal wheel scrolling in all other cases
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only block keyboard during active carousel, not reset
      if (isCarouselActive && !isResetting) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageUp' || e.key === 'PageDown') {
          e.preventDefault();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only block touch during active carousel, not reset
      if (isCarouselActive && !isResetting) {
        e.preventDefault();
      }
    };

    // Always add scroll listener, let the handler decide what to do
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isCarouselActive, isResetting, carouselProgress, headerOffsetTop, experienceOffsetTop, navbarHeight, lastScrollY, carouselCompleted]);

  // Cleanup on unmount - comprehensive reset
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowY = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  const horizontalOffset = carouselProgress * (skills.length * 96 + (skills.length - 1) * 32);

  return (
    <section ref={containerRef} className="h-36 relative">
      {/* Debug info - remove after testing 
      <div className="fixed top-16 right-4 bg-black/80 text-white text-xs p-2 rounded z-50 font-mono">
        <div>Carousel Active: {isCarouselActive ? 'YES' : 'NO'}</div>
        <div>Resetting: {isResetting ? 'YES' : 'NO'}</div>
        <div>Progress: {Math.round(carouselProgress * 100)}%</div>
        <div>Completed: {carouselCompleted ? 'YES' : 'NO'}</div>
        <div>Scroll Y: {Math.round(lastScrollY)}</div>
        <div>Header Top: {Math.round(headerOffsetTop)}</div>
        <div>Navbar H: {navbarHeight}</div>
        <div>Trigger: {Math.round(headerOffsetTop - navbarHeight - 50)}</div>
      </div>*/}

      <div className="flex gap-2 overflow-hidden p-10 h-36">
        <motion.div 
          className="flex gap-8"
          style={{ transform: `translateX(-${horizontalOffset}px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {skills.map((skill, index) => {
            const LogoComponent = skill.logo, skillName = skill.name;
            return (
              <Container key={`${skill.name}-${index}`} className="shrink-0 flex flex-col items-center justify-center" href={skill.link}>
                <LogoComponent className="h-6 w-6 text-white" />
                <span className="text-Beige text-[10px]">{skillName}</span>
              </Container>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const Container = ({
  className,
  children,
  href,
}: {
  className?: string;
  children: React.ReactNode;
  href?: string;
}) => {
  return (
    <motion.button
        initial={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.2, opacity: 1 }}
        className={cn(
        `h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
        shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
        `,
        className)}
        onClick={() => {
          if (href) {
            window.open(href, "_blank");
          }
        }}
      >
      {children}
    </motion.button>
  );
};

export const ClaudeLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 512 512"
      className={className}
    >
      <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042" />
      <path
        fill="#1F1F1E"
        fillRule="nonzero"
        d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
      />
    </svg>
  );
};

export const OpenAILogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.153 11.46a6.888 6.888 0 0 0-.608-5.73 7.117 7.117 0 0 0-3.29-2.93 7.238 7.238 0 0 0-4.41-.454 7.065 7.065 0 0 0-2.41-1.742A7.15 7.15 0 0 0 12.514 0a7.216 7.216 0 0 0-4.217 1.346 7.061 7.061 0 0 0-2.603 3.539 7.12 7.12 0 0 0-2.734 1.188A7.012 7.012 0 0 0 .966 8.268a6.979 6.979 0 0 0 .88 8.273 6.89 6.89 0 0 0 .607 5.729 7.117 7.117 0 0 0 3.29 2.93 7.238 7.238 0 0 0 4.41.454 7.061 7.061 0 0 0 2.409 1.742c.92.404 1.916.61 2.923.604a7.215 7.215 0 0 0 4.22-1.345 7.06 7.06 0 0 0 2.605-3.543 7.116 7.116 0 0 0 2.734-1.187 7.01 7.01 0 0 0 1.993-2.196 6.978 6.978 0 0 0-.884-8.27Zm-10.61 14.71c-1.412 0-2.505-.428-3.46-1.215.043-.023.119-.064.168-.094l5.65-3.22a.911.911 0 0 0 .464-.793v-7.86l2.389 1.36a.087.087 0 0 1 .046.065v6.508c0 2.952-2.491 5.248-5.257 5.248ZM4.062 21.354a5.17 5.17 0 0 1-.635-3.516c.042.025.115.07.168.1l5.65 3.22a.928.928 0 0 0 .928 0l6.898-3.93v2.72a.083.083 0 0 1-.034.072l-5.711 3.255a5.386 5.386 0 0 1-4.035.522 5.315 5.315 0 0 1-3.23-2.443ZM2.573 9.184a5.283 5.283 0 0 1 2.768-2.301V13.515a.895.895 0 0 0 .464.793l6.897 3.93-2.388 1.36a.087.087 0 0 1-.08.008L4.52 16.349a5.262 5.262 0 0 1-2.475-3.185 5.192 5.192 0 0 1 .527-3.98Zm19.623 4.506-6.898-3.93 2.388-1.36a.087.087 0 0 1 .08-.008l5.713 3.255a5.28 5.28 0 0 1 2.054 2.118 5.19 5.19 0 0 1-.488 5.608 5.314 5.314 0 0 1-2.39 1.742v-6.633a.896.896 0 0 0-.459-.792Zm2.377-3.533a7.973 7.973 0 0 0-.168-.099l-5.65-3.22a.93.93 0 0 0-.928 0l-6.898 3.93V8.046a.083.083 0 0 1 .034-.072l5.712-3.251a5.375 5.375 0 0 1 5.698.241 5.262 5.262 0 0 1 1.865 2.28c.39.92.506 1.93.335 2.913ZM9.631 15.009l-2.39-1.36a.083.083 0 0 1-.046-.065V7.075c.001-.997.29-1.973.832-2.814a5.297 5.297 0 0 1 2.231-1.935 5.382 5.382 0 0 1 5.659.72 4.89 4.89 0 0 0-.168.093l-5.65 3.22a.913.913 0 0 0-.465.793l-.003 7.857Zm1.297-2.76L14 10.5l3.072 1.75v3.5L14 17.499l-3.072-1.75v-3.5Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};
export const GeminiLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
        fill="url(#prefix__paint0_radial_980_20147)"
      />
      <defs>
        <radialGradient
          id="prefix__paint0_radial_980_20147"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
        >
          <stop offset=".067" stop-color="#9168C0" />
          <stop offset=".343" stop-color="#5684D1" />
          <stop offset=".672" stop-color="#1BA1E3" />
        </radialGradient>
      </defs>
    </svg>
  );
};


