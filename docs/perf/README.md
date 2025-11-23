# Performance Budget & Optimization

## Performance Goals

- **Time to Interactive (TTI)**: ≤ 2s on mid-tier Android (throttled)
- **Initial Route JS**: ≤ 100 KB gzipped
- **First Load Total**: ≤ 150 KB gzipped

## Budget Verification

Run Lighthouse audit:

```bash
npm run build
npm run preview
# Open Chrome DevTools > Lighthouse
# Select "Mobile" + "Performance" + "Progressive Web App"
```

## Optimization Techniques Applied

1. **Code Splitting**
   - Lazy-loaded Lessons, Games, and Profiles pages
   - Phaser engine loaded only when needed
   - sql.js + TypeORM deferred until first database operation

2. **Asset Optimization**
   - Service worker precaching for app shell
   - Runtime caching for images, audio, fonts
   - Cache-first strategy for static assets

3. **Bundle Size**
   - Preact instead of React (~3KB vs ~40KB)
   - Manual chunks for heavy libraries (Phaser, TypeORM)
   - Tree-shaking enabled in Vite

4. **Database Performance**
   - Lazy initialization of sql.js WASM
   - IndexedDB persistence with auto-save
   - Indexed queries for fast lookups

## Monitoring

Track performance metrics:
- Core Web Vitals (LCP, FID, CLS)
- TTI and Speed Index
- Bundle sizes in production builds

## Future Optimizations

- Image compression for lesson assets
- Audio file optimization (compress to smaller bitrate)
- Virtual scrolling for long lesson lists
- Incremental database loading
