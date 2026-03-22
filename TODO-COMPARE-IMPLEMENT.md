# Compare Page Updates TODO

## Plan Steps (Approved)

**Status: In Progress**

### 1. [DONE ✅] Remove alliance win rate displays from AllianceSummaryCard.tsx
   - Remove the Win Rate grid item showing avgWinrate %
   - Adjust grid layout to `grid-cols-2` still (Avg EPA/Total EPA top, Experience/Recent Form bottom; drop Recent or adjust to cols-1 if uneven)

### 2. [DONE ✅] Add reset button to page.tsx
   - Add handleReset function to clear: teamInputs, slotTeams, allianceSummary, prediction
   - Add button beside Load Selected Teams button, styled with trash/recycle icon, disabled if no teams loaded

### 3. [PENDING] Test & Verify
   - Empty slots show no TeamCard
   - Only filled AllianceSummaryCards if allianceSummary
   - Prediction disappears on new teams (already does)
   - Reset clears everything to initial state
   - Update this TODO with completion marks

**Next: Test & Verify - Task Complete**

