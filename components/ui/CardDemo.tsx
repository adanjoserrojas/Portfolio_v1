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
  FaJs,
  FaDocker,
  FaAws
} from "react-icons/fa";
import { 
  SiTypescript, 
  SiJavascript, 
  SiNextdotjs, 
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiExpress,
  SiRedis,
  SiKubernetes,
  SiGraphql
} from "react-icons/si";
import { GoCopilot } from "react-icons/go";

type CardDemoProps = {
    SkillName?: string;
    Description?: string;
    logo?: React.ComponentType<{ className?: string }>;
};
export function CardDemo({}: CardDemoProps) {

  return (
    <Skeleton />
  );
}

const Skeleton = () => {
  const skills = [
    { logo: FaReact, name: "React" },
    { logo: FaNodeJs, name: "Node.js" },
    { logo: FaPython, name: "Python" },
    { logo: FaJava, name: "Java" },
    { logo: SiTypescript, name: "TypeScript" },
    { logo: SiJavascript, name: "JavaScript" },
    { logo: SiNextdotjs, name: "Next.js" },
    { logo: SiTailwindcss, name: "Tailwind" },
    { logo: SiMongodb, name: "MongoDB" },
    { logo: SiPostgresql, name: "PostgreSQL" },
    { logo: SiExpress, name: "Express" },
    { logo: SiRedis, name: "Redis" },
    { logo: FaGitAlt, name: "Git" },
    { logo: FaDocker, name: "Docker" },
    { logo: SiKubernetes, name: "Kubernetes" },
    { logo: FaAws, name: "AWS" },
    { logo: SiGraphql, name: "GraphQL" },
    { logo: FaHtml5, name: "HTML5" },
    { logo: FaCss3Alt, name: "CSS3" },
    { logo: GoCopilot, name: "GitHub Copilot" },
  ];
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const horizontalScroll = useTransform(scrollYProgress, [0, 1], ["40%", "-100%"]);
  return (
    <section ref={targetRef} className="h-36 relative">
      <div className="top-0 flex gap-2 overflow-hidden p-10 h-36">
        <motion.div style={{ x: horizontalScroll }} className="flex gap-8 items-center">
          {skills.map((skill, index) => {
            const LogoComponent = skill.logo;
            return (
              <Container key={`${skill.name}-${index}`} className="shrink-0">
                <LogoComponent className="h-6 w-6 text-white" />
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
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
        initial={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.2, opacity: 1 }}
        className={cn(
        `h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
        shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
        `,
        className)}>
      {children}
    </motion.div>
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


