import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Maze } from './maze/maze';
import { WordSearch } from './wordsearch/wordsearch';
import { About } from './about/about';
import { Author } from './about/author';
import { Illustrators } from './about/illustrators';
import { ActivitiesPage } from './activities/activities';
import { LearnHub } from './learn/learn-hub';
import { LearnTopic } from './learn/learn-topic';
import { LEARN_SLUGS } from './learn/topics';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'about/author', component: Author },
  { path: 'about/illustrators', component: Illustrators },
  { path: 'activities', component: ActivitiesPage },
  { path: 'maze', component: Maze },
  { path: 'wordsearch', component: WordSearch },
  { path: 'learn', component: LearnHub },
  { path: 'learn/:slug', component: LearnTopic },
  { path: '**', redirectTo: '' },
];

export const PRERENDER_ROUTES = [
  '/',
  '/about',
  '/about/author',
  '/about/illustrators',
  '/activities',
  '/maze',
  '/wordsearch',
  '/learn',
  ...LEARN_SLUGS.map((s) => `/learn/${s}`),
];
