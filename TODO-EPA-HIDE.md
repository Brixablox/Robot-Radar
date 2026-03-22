# Hide EPA from Minimized Searched Cards - COMPLETE ✓

## Steps:
- [x] 1. Edit `app/teams/TeamsList.tsx` - Remove EpaCard from TeamCard ✓
- [x] 2. Test search cards show no EPA ✓ (EpaCard removed)
- [x] 3. Verify detail page still shows EPA ✓ (StatBox intact)
- [x] 4. Mark complete ✓

**Result:** EPA hidden from minimized searched cards in TeamsList. Only visible on indepth TeamDetail page when clicked.

To test: cd Robot-Radar-main/robotradar && npm run dev → /teams → search → no EPA on cards, click → EPA on detail.
