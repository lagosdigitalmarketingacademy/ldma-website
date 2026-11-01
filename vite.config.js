import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  build:{
    rollupOptions:{
      input:{
        main:'index.html',
        business:'for-business/index.html',
        battleship:'battleship/index.html',
        calendar:'calendar/index.html',
        apply:'apply/index.html',
        insights:'insights/index.html',
        instagramConversion:'insights/why-instagram-views-dont-become-sales/index.html',
        marketingPlan:'insights/how-to-build-a-marketing-plan-in-nigeria/index.html',
        aiForBusiness:'insights/practical-ai-for-nigerian-business-teams/index.html',
        privacy:'privacy/index.html'
      }
    }
  }
});
