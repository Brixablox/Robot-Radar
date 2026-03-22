# Matches Tab Implementation

## Steps:

- [x] 1. Update NavDock.tsx: Change Auto → Matches (href="/matches", label="Matches", icon=<List />)
- [x] 2. Add frc.ts: Types (TbaEvent, TbaMatchSimple) + functions (getTbaEvents, getTbaEventMatches, getCurrentEventStatus)
- [x] 3. Create app/api/events/route.ts (list current year events)
- [x] 4. Create app/api/events/search/route.ts (search events by name)
- [x] 5. Create app/api/matches/[eventKey]/route.ts (event matches + current)
- [x] 6. Create app/matches/page.tsx (MatchesClient: search/list events like TeamsClient)
- [x] 7. Create components/MatchesList.tsx (grid like TeamsList.tsx)
- [x] 8. Create app/matches/[eventKey]/page.tsx (timeline with blinking dots, bracket)
- [x] 9. Remove app/auto/page.tsx (no longer needed)
- [x] 10. Test: npm run dev, /matches search, click event for timeline (demo data requires TBA_API_KEY)

## Notes:
- Use TBA primarily (events/{year}, event/{key}/matches/simple)
- Default year: 2026
- Styles match teams page
- Animate current stage dot blink (framer-motion pulse)
- TS fix applied (mt → marginTop)

**Ready!** Run `npm run dev` → Matches tab → search events → click for live timeline/bracket.

