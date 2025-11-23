# Privacy & Security for Under-13 Audience

## Privacy-First Design

This app is designed for children under 13 and follows strict privacy principles:

### No Data Collection
- ✅ **100% Local Storage**: All data stored locally in IndexedDB
- ✅ **No Analytics**: No tracking, cookies, or analytics scripts
- ✅ **No External Services**: No third-party integrations
- ✅ **Offline-First**: Works completely offline after initial load

### Data Stored Locally

The following data is stored only on the user's device:
- Profile information (name, avatar)
- Lesson completion progress
- Game scores and achievements
- Streak and badge data
- App settings

### Security Hardening

1. **Content Security Policy (CSP)**
   - Add to index.html for production
   - Restrict script sources
   - Prevent inline scripts

2. **No User-Generated Content**
   - All content is pre-loaded and vetted
   - No chat, comments, or sharing features

3. **Parent Controls**
   - Data wipe capability per profile
   - Global reset option
   - No account creation required

## COPPA Compliance

This app is designed to comply with the Children's Online Privacy Protection Act (COPPA):
- No personal information collected
- No persistent identifiers sent externally
- No behavioral advertising
- No social features

## Data Retention

- Data persists locally until manually deleted by user/parent
- No automatic backup to cloud
- No data transmission to servers

## Recommendations for Deployment

1. Serve over HTTPS only
2. Implement CSP headers
3. Add privacy policy page (if required by app store)
4. Include parental consent flow (if distributing on app stores)
