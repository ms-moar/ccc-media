# Focus Application - Claude Instructions

## Automatic Cookie Banner Dismissal

**IMPORTANT**: When visiting any website using Claude in Chrome, ALWAYS run the auto-dismiss script FIRST before analyzing the page:

1. After navigating to a URL, immediately execute:
```javascript
// Read and execute the auto-dismiss script
const dismissScript = await fs.readFile('./auto_dismiss_banners.js', 'utf-8');
javascript_tool.execute(dismissScript, tabId);
```

2. Or use the inline version directly via `mcp__claude-in-chrome__javascript_tool`

This prevents wasting time and tokens trying to find and click cookie banners manually.

## Chrome Extension Context Management

When using the Chrome extension (Claude in Chrome) to interact with web pages:

- **Be mindful of context usage** - Only load what's necessary for the task
- **Avoid loading DOM elements or HTML unnecessarily** - Don't extract full page source or DOM trees unless explicitly requested
- **Use targeted queries** - Use `read_page` with specific `ref_id` or `find` to locate specific elements instead of loading everything
- **Prefer screenshots** - For visual analysis, take screenshots instead of reading entire DOM structures
- **Use JavaScript sparingly** - Only execute JavaScript when needed for specific data extraction, avoid dumping entire HTML/DOM content
- **Optimize for token efficiency** - Large HTML/DOM dumps consume significant context tokens without adding value

## Best Practices

1. Start with `tabs_context_mcp` to understand available tabs
2. **Navigate to URL, then immediately run auto-dismiss script**
3. Use `screenshot` for visual inspection
4. Use `read_page` with filters (`interactive` or specific `ref_id`) for targeted element access
5. Use `find` to locate specific elements by purpose
6. Only use JavaScript for precise data extraction when other methods won't work

## Testing Report Documentation

**IMPORTANT**: Document test results progressively as you test, AND create a comprehensive testing report after all testing is complete.

### Progressive Test Documentation

**CRITICAL**: After completing EACH individual test case, immediately document the result:

1. **Create a `test_progress/` folder** in the project root if it doesn't exist

2. **Document each test case** in a separate markdown file named by test case ID or name:
   - Format: `test_progress/TC001_[test_name].md` or `test_progress/[feature]_test_[number].md`

3. **Each test case file should include**:
   - Test case ID/name
   - Test date/time
   - Description
   - Steps performed
   - Expected result
   - Actual result
   - Status (Pass/Fail/Skip)
   - Screenshots or evidence (saved to `test_progress/screenshots/`)
   - Notes or observations
   - Any issues discovered

4. **Benefits of progressive documentation**:
   - Real-time tracking of test progress
   - No loss of test data if testing is interrupted
   - Easy to see which test cases have been completed
   - Immediate capture of findings while fresh in memory

### Final Comprehensive Report Requirements

1. **Create a testing report** in markdown format (e.g., `TESTING_REPORT.md` or `TEST_RESULTS_[DATE].md`)

2. **Include the following sections**:
   - **Test Summary**: Overview of total tests, passed, failed, and skipped
   - **Test Environment**: Browser, OS, application version, test date/time
   - **Test Cases**: Detailed results for each test case including:
     - Test case ID/name
     - Description
     - Expected result
     - Actual result
     - Status (Pass/Fail/Skip)
     - Screenshots or evidence (if applicable)
     - Notes or observations
   - **Issues Found**: List of bugs or issues discovered during testing
   - **Recommendations**: Suggestions for fixes or improvements
   - **Conclusion**: Overall assessment of the testing session

3. **Format Example**:
```markdown
# Testing Report - [Date]

## Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X
- Pass Rate: X%

## Test Environment
- Browser: Chrome X.X
- OS: macOS/Windows/Linux
- Application Version: X.X.X
- Test Date: YYYY-MM-DD HH:MM

## Test Cases

### Test Case 1: [Name]
- **Description**: [What was tested]
- **Expected Result**: [What should happen]
- **Actual Result**: [What actually happened]
- **Status**: ✅ Pass / ❌ Fail / ⏭️ Skip
- **Evidence**: [Screenshot path or description]
- **Notes**: [Any observations]

...

## Issues Found
1. [Issue description, severity, steps to reproduce]

## Recommendations
1. [Suggested fixes or improvements]

## Conclusion
[Overall assessment and next steps]
```

4. **Save screenshots** referenced in the report to a `test-evidence/` or `screenshots/` directory (progressive screenshots should be in `test_progress/screenshots/`)

5. **Reference the test_progress folder** - The final report should summarize findings from all individual test case files in the `test_progress/` folder

6. **Commit both** the progressive test files and final report to version control after testing is complete

7. **Check Context First** - Before starting any testing operation check if the context is enough for the task. If not then do autocompact before starting the test.
