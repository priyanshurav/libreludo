import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/how-to-play', '/setup', '/404'],
} satisfies Config;
