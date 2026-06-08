import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Maze } from './maze/maze';
import { WordSearch } from './wordsearch/wordsearch';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'maze', component: Maze },
  { path: 'wordsearch', component: WordSearch },
  { path: '**', redirectTo: '' },
];
