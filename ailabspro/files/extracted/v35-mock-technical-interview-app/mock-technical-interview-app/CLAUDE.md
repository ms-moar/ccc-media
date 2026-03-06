# Claude Code Instructions

## Stitch MCP Best Practices

When using Stitch MCP to create web designs:

- **Create long, comprehensive designs in a single pane** - Do not send prompts to Stitch section by section. Instead, describe the entire page or component in one detailed prompt so Stitch generates a cohesive, complete design in a single pass.
- This ensures visual consistency and proper layout flow across the entire design.
- **Include all UI states in your prompt** - Specify loading states, error states, empty states, and success states so the design accounts for all scenarios.
- **Describe the target device type** - Specify whether the design is for mobile, desktop, or tablet to ensure appropriate layouts and touch targets.
- **Provide context about the app's purpose** - Include information about the target audience and use case to help generate more appropriate designs.
- **Specify interactive elements clearly** - Call out which elements should be buttons, inputs, dropdowns, toggles, etc., and describe their expected behavior.
- **Include placeholder content** - Describe realistic sample data and content to make the design more representative of the final product.

### Iterating on Stitch Designs

- Use follow-up prompts to refine specific areas rather than regenerating the entire design.
- Reference specific sections when requesting changes (e.g., "Update the header section to...").
- Export the design code once satisfied, then implement and test with agent-browser.

## Testing

For all sorts of testing (UI testing, visual testing, end-to-end testing, browser testing), use the `agent-browser` tools.

If you are unsure about available commands or how to use them, run:

```bash
agent-browser --help
```

This will show all available commands and options for browser-based testing.

### UX Testing Best Practices

When testing with `agent-browser`, ensure thorough UX validation:

- **Verify app functionality works as intended** - Test all user flows, interactions, and features to confirm they behave correctly.
- **Test editability of interactive elements** - Ensure items that should be editable (like code panels, text inputs, forms) are actually editable and respond to user input.
- **Validate user experience quality** - Check that the UI is intuitive, responsive, and provides appropriate feedback for user actions.
- **Test keyboard navigation and accessibility** - Verify that users can navigate and interact with the app using keyboard controls where expected.
- **Test all UI states** - Verify loading indicators, error messages, empty states, and success feedback all display correctly.
- **Test with realistic data** - Use representative sample data to ensure the UI handles real-world content properly.
- **Capture screenshots for documentation** - Take screenshots of key states and flows for reference and debugging.

### Responsive and Cross-Browser Testing

- Test on different viewport sizes to verify responsive behavior.
- Ensure touch targets are appropriately sized on mobile views.
- Verify that layouts adapt gracefully at different breakpoints.

## Design-to-Implementation Workflow

Follow this workflow when building UI with Stitch MCP and validating with agent-browser:

1. **Design Phase** - Use Stitch MCP to create the complete UI design in a single comprehensive prompt.
2. **Review Design** - Examine the generated design and iterate with follow-up prompts if needed.
3. **Implement** - Export and integrate the design code into the application.
4. **Test Functionality** - Use agent-browser to verify all interactive elements work correctly.
5. **Test UX** - Validate the user experience including editability, navigation, and feedback.
6. **Iterate** - If issues are found, update the code and re-test until the experience is polished.

### Common Issues to Check

- Forms submit data correctly and show validation errors appropriately.
- Navigation links and buttons trigger the expected actions.
- Modal dialogs open, close, and handle their content properly.
- Data displays update when underlying state changes.
- Scroll behavior works correctly for long content areas.
- Code editors, text areas, and rich inputs accept and preserve user input.

## Agent App Considerations

When building apps designed for agent interaction:

- **Ensure programmatic accessibility** - Elements should be easily targetable by selectors for automated testing.
- **Provide clear feedback** - Actions should result in visible state changes that can be verified.
- **Handle async operations gracefully** - Loading states should be detectable and completion should be confirmable.
- **Use semantic HTML** - Proper element types make automation more reliable.
- **Avoid timing-dependent interactions** - Animations and delays should not break automated workflows.
- **Test the full agent workflow** - Simulate the complete user journey an agent would take through the app.
