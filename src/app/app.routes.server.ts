import { RenderMode, ServerRoute } from '@angular/ssr';
import { LEARN_SLUGS } from './learn/topics';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'learn/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LEARN_SLUGS.map((slug) => ({ slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
