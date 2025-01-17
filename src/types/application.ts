export type ApplicationFramework = 'react' | 'vue' | 'nextjs';

export const APPLICATION_FRAMEWORKS: ApplicationFramework[] = [
  'react',
  'vue',
  'nextjs',
];

export const FRAMEWORK_LABELS: Record<ApplicationFramework, string> = {
  react: 'React',
  nextjs: 'Next.js',
  vue: 'Vue',
};