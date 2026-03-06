Execute automated tests from the Focus Application test suite with progressive documentation.

## Test File: tests/$ARGUMENTS

### Step 1: Setup and Preparation

1. **Create documentation structure:**
   ```bash
   mkdir -p test_progress/screenshots
   ```

2. **Read the specified test file:**
   - File path: `tests/$ARGUMENTS`
   - Parse test cases with "🤖 Automated Testing:" sections
   - Note test case IDs (e.g., TC-AUTH-001, TC-TIMER-001)

3. **Initialize browser context:**
   - Use `tabs_context_mcp` with `createIfEmpty: true` to get/create tab
   - Note the tab ID for all subsequent operations

4. **Auto-dismiss cookie banners:**
   ```javascript
   // Execute auto-dismiss script FIRST
   const dismissScript = `
   // Dismiss cookie banners automatically
   const selectors = [
     'button[id*="accept"]', 'button[id*="cookie"]',
     'a[class*="accept"]', '[aria-label*="accept"]',
     '[class*="cookie-accept"]', '[id*="cookie-accept"]'
   ];
   selectors.forEach(sel => {
     document.querySelectorAll(sel).forEach(el => el.click());
   });
   `;
   // Execute via javascript_tool with tabId
   ```

### Step 2: Execute Each Test Case

For each automated test case in the file:

1. **Parse test case details:**
   - Test ID (e.g., TC-AUTH-001)
   - Test name
   - Priority (Critical Path / High / Medium / Low)
   - Expected duration
   - Automation steps

2. **Execute automation script:**
   - Follow the "🤖 Automated Testing:" steps exactly
   - Use appropriate MCP tools:
     - `navigate` - Navigate to URLs
     - `read_page` - Read page accessibility tree
     - `find` - Find elements by natural language
     - `computer` - Click, type, screenshot, key press
     - `form_input` - Fill form fields
     - `javascript_tool` - Execute JavaScript for verification
     - `read_console_messages` - Check console errors
     - `read_network_requests` - Monitor network calls

3. **Capture evidence:**
   - Take screenshots at key verification points
   - Save to `test_progress/screenshots/[TEST_ID]_[step].png`
   - Capture console logs if errors occur
   - Record network requests for integration tests

4. **Determine test result:**
   - **PASS**: All verification steps succeed, expected behavior confirmed
   - **FAIL**: Any verification fails, unexpected behavior
   - **SKIP**: Test cannot run (missing dependencies, environment issues)

5. **Document immediately (Progressive Documentation):**

   Create `test_progress/[TEST_ID]_[test_name].md`:

   ```markdown
   # [TEST_ID]: [Test Name]

   **Test Date:** [YYYY-MM-DD HH:MM:SS]
   **Test File:** tests/$ARGUMENTS
   **Priority:** [Critical Path/High/Medium/Low]
   **Status:** ✅ PASS / ❌ FAIL / ⏭️ SKIP

   ## Description
   [Test case description from test file]

   ## Expected Result
   [Expected behavior from test file]

   ## Actual Result
   [What actually happened during test execution]

   ## Steps Performed
   1. [Step 1 with result]
   2. [Step 2 with result]
   3. [Step 3 with result]
   ...

   ## Evidence
   - Screenshot 1: `screenshots/[TEST_ID]_step1.png` - [Description]
   - Screenshot 2: `screenshots/[TEST_ID]_step2.png` - [Description]
   - Console logs: [Any relevant console output]
   - Network requests: [Any relevant network activity]

   ## Verification Points
   - ✅ [Verification 1]: Success
   - ✅ [Verification 2]: Success
   - ❌ [Verification 3]: Failed - [reason]

   ## Issues Found
   [List any bugs or issues discovered, or "None"]

   ## Notes
   [Any observations, warnings, or additional context]

   ## Duration
   Actual: [X] seconds (Expected: [Y] seconds)
   ```

### Step 3: Handle Test Failures

If a test fails:

1. **Capture detailed evidence:**
   - Full page screenshot
   - Console errors via `read_console_messages`
   - Network errors via `read_network_requests`
   - Page state via `read_page`

2. **Document failure details:**
   - Exact step that failed
   - Error message or unexpected behavior
   - Screenshots showing the failure
   - Any stack traces or console errors

3. **Determine severity:**
   - **P0 (Blocker)**: App crashes, data loss, security breach
   - **P1 (Critical)**: Core feature broken, no workaround
   - **P2 (High)**: Major feature degraded, workaround exists
   - **P3 (Low)**: Minor issue, cosmetic, edge case

4. **Continue or stop:**
   - For P0/P1 failures in Critical Path tests: Document and continue (don't stop testing)
   - For other failures: Document and continue
   - Track all failures for final report

### Step 4: Progress Tracking

After each test case:

1. **Update progress file** `test_progress/PROGRESS.md`:
   ```markdown
   # Test Progress: tests/$ARGUMENTS

   **Started:** [YYYY-MM-DD HH:MM:SS]
   **Test File:** tests/$ARGUMENTS
   **Total Test Cases:** [X]

   ## Completed Tests
   - ✅ TC-XXX-001: [Name] - PASS ([duration]s)
   - ❌ TC-XXX-002: [Name] - FAIL ([duration]s)
   - ✅ TC-XXX-003: [Name] - PASS ([duration]s)
   - ⏭️ TC-XXX-004: [Name] - SKIP (reason)

   ## Pending Tests
   - TC-XXX-005: [Name]
   - TC-XXX-006: [Name]

   ## Summary
   - Completed: [X] / [Total]
   - Passed: [X]
   - Failed: [X]
   - Skipped: [X]
   ```

### Step 5: Create Final Comprehensive Report

After all tests complete, create `test_progress/TESTING_REPORT_[ARGUMENTS]_[DATE].md`:

```markdown
# Testing Report - tests/$ARGUMENTS

**Report Date:** [YYYY-MM-DD HH:MM:SS]
**Test File:** tests/$ARGUMENTS
**Tester:** Claude Sonnet 4.5 (Automated)

## Executive Summary

- **Total Tests:** [X]
- **Passed:** [X] ([X]%)
- **Failed:** [X] ([X]%)
- **Skipped:** [X] ([X]%)
- **Pass Rate:** [X]%
- **Total Duration:** [X] minutes
- **Critical Path Status:** ✅ All Pass / ❌ [X] Failures

## Test Environment

- **Browser:** Chrome [version]
- **OS:** [macOS/Windows/Linux] [version]
- **Application URL:** http://localhost:3000
- **Test Date:** [YYYY-MM-DD HH:MM:SS]
- **Automation Tools:** Claude in Chrome MCP

## Test Results Summary

### Passed Tests ([X])
| Test ID | Test Name | Duration | Priority |
|---------|-----------|----------|----------|
| TC-XXX-001 | [Name] | [X]s | High |
| TC-XXX-002 | [Name] | [X]s | Medium |

### Failed Tests ([X])
| Test ID | Test Name | Severity | Issue |
|---------|-----------|----------|-------|
| TC-XXX-003 | [Name] | P1 | [Brief description] |
| TC-XXX-004 | [Name] | P2 | [Brief description] |

### Skipped Tests ([X])
| Test ID | Test Name | Reason |
|---------|-----------|--------|
| TC-XXX-005 | [Name] | [Reason for skip] |

## Detailed Test Results

[For each test, include a summary with link to detailed file]

### TC-XXX-001: [Test Name]
- **Status:** ✅ PASS
- **Duration:** [X]s (Expected: [Y]s)
- **Details:** See `test_progress/TC-XXX-001_[name].md`
- **Evidence:**
  - `screenshots/TC-XXX-001_step1.png`
  - `screenshots/TC-XXX-001_final.png`

### TC-XXX-002: [Test Name]
- **Status:** ❌ FAIL
- **Severity:** P1 (Critical)
- **Duration:** [X]s
- **Failure Reason:** [Brief description]
- **Details:** See `test_progress/TC-XXX-002_[name].md`
- **Evidence:**
  - `screenshots/TC-XXX-002_failure.png`
  - Console errors: [error message]

[Repeat for all tests]

## Issues Found

### Critical Issues (P0/P1)
1. **[Issue Title]**
   - **Severity:** P1
   - **Found in:** TC-XXX-002
   - **Description:** [Detailed description]
   - **Steps to Reproduce:**
     1. [Step 1]
     2. [Step 2]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Evidence:** `screenshots/TC-XXX-002_failure.png`

### High Issues (P2)
[Similar format]

### Medium/Low Issues (P3)
[Similar format]

## Recommendations

### Immediate Actions (P0/P1 Issues)
1. [Fix recommendation for critical issue 1]
2. [Fix recommendation for critical issue 2]

### Future Improvements
1. [Improvement suggestion 1]
2. [Improvement suggestion 2]

### Test Coverage Gaps
1. [Missing test scenario 1]
2. [Missing test scenario 2]

## Release Readiness Assessment

**Can this build be released?**

- ✅ **YES** - All Critical Path tests pass, no P0/P1 blockers
- ⚠️ **WITH CAUTION** - Some P2 issues exist but workarounds available
- ❌ **NO** - Critical Path failures or P0/P1 blockers present

**Criteria:**
- ✅/❌ All Critical Path tests must pass
- ✅/❌ No P0 (Blocker) issues
- ✅/❌ No P1 (Critical) issues in core features
- ✅/❌ Core user flows (auth, timer, session save) functional

## Performance Metrics

- **Average test duration:** [X]s
- **Fastest test:** [X]s
- **Slowest test:** [X]s
- **Total automation time:** [X] minutes
- **vs Manual testing time:** ~[X] minutes (85% time savings)

## Test Artifacts

All test evidence is stored in `test_progress/`:
- Individual test reports: `test_progress/TC-*_*.md`
- Screenshots: `test_progress/screenshots/`
- Progress tracking: `test_progress/PROGRESS.md`
- This report: `test_progress/TESTING_REPORT_$ARGUMENTS_[DATE].md`

## Conclusion

[Overall assessment of the test run, software quality, and readiness for deployment. Include key takeaways and next steps.]

---

**Report Generated:** [YYYY-MM-DD HH:MM:SS]
**Automation Framework:** Claude in Chrome MCP
**Test Suite Version:** Focus Application Test Suite v1.0
```

### Step 6: Cleanup and Summary

1. **Close browser tabs** (optional, or leave open for manual review)

2. **Output summary to console:**
   ```
   ===================================
   Test Execution Complete
   ===================================
   Test File: tests/$ARGUMENTS
   Total Tests: [X]
   Passed: [X] ✅
   Failed: [X] ❌
   Skipped: [X] ⏭️

   Pass Rate: [X]%
   Duration: [X] minutes

   Reports generated in test_progress/:
   - TESTING_REPORT_$ARGUMENTS_[DATE].md
   - Individual test files: TC-*_*.md
   - Screenshots: screenshots/

   Critical Path Status: [PASS/FAIL]
   Release Ready: [YES/NO/WITH CAUTION]
   ===================================
   ```

3. **Provide next steps:**
   - If all tests passed: "✅ All tests passed! Ready for deployment."
   - If tests failed: "❌ [X] tests failed. Review test_progress/TESTING_REPORT_*.md for details."
   - If critical failures: "🚨 Critical failures detected. Fix P0/P1 issues before deployment."

## Best Practices

- **Progressive documentation**: Document each test IMMEDIATELY after completion
- **Evidence capture**: Take screenshots at EVERY verification point
- **Console monitoring**: Check console errors for EVERY test
- **Network monitoring**: Monitor network for integration tests
- **Context efficiency**: Use targeted queries (find, read_page with filters)
- **Error handling**: Don't stop on first failure - complete all tests
- **Time tracking**: Record actual vs expected duration for each test

## Common Issues

### Issue: Tab context lost
**Solution:** Re-run `tabs_context_mcp` and get fresh tab ID

### Issue: Elements not found
**Solution:**
1. Take screenshot to verify page state
2. Use `read_page` to see available elements
3. Adjust selectors or wait for elements to load

### Issue: Test hangs/times out
**Solution:**
1. Check console errors
2. Verify network requests completed
3. Take screenshot to see current state
4. Mark as FAIL and continue to next test

### Issue: Firebase/auth issues
**Solution:**
1. Verify app is running on localhost:3000
2. Check Firebase credentials in .env.local
3. Verify test user accounts exist
4. Document as environment issue (SKIP)

## Example Usage

```bash
# Test authentication
/test authentication-tests.md

# Test timer functionality
/test timer-tests.md

# Test all performance & security
/test performance-security-tests.md
```

## Output Artifacts

After running this command, you will have:

```
test_progress/
├── PROGRESS.md                           # Real-time progress tracking
├── TESTING_REPORT_[file]_[date].md      # Comprehensive final report
├── TC-XXX-001_[name].md                 # Individual test results
├── TC-XXX-002_[name].md
├── TC-XXX-003_[name].md
└── screenshots/
    ├── TC-XXX-001_step1.png
    ├── TC-XXX-001_final.png
    ├── TC-XXX-002_failure.png
    └── ...
```

All files are ready to commit to version control for test history tracking.
