import { createMemoryHistory, createRouter } from 'vue-router';

import Landing from './components/landing/Landing.vue';
import Voting from './components/voting/Voting.vue';
import Data from './components/data/Data.vue';

const routes = [
  { path: '/', component: Landing },
  { path: '/voting', component: Voting },
  { path: '/data', component: Data },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});