# Alliance Stats & Win Prediction TODO

## Plan Steps
- [ ] 1. Update API route.ts to include recentMatches (last 10 matches win/loss)
- [ ] 2. Create AllianceSummaryCard.tsx for totals display
- [ ] 3. Edit page.tsx: 
  - Add allianceStats state & computeAllianceStats func (total/avg EPA, avg winrate weighted by games, total years exp, combined recent win %)
  - useEffect to recompute on slotTeams change
  - Add AllianceSummaryCard below each alliance row
  - Add central "Calculate Win Rate" button & prediction state/logic
  - Update TeamCard: remove individual winrate/record section (alliance only)
- [ ] 4. Test: npm run dev, load teams, verify totals & prediction
- [ ] 5. Style refinements & complete

Current: Starting API update
