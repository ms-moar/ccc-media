# Adding WebMCP to a Plain HTML Form: An Architecture-Level Guide

## 1. What is WebMCP?

WebMCP is a proposed web standard that gives AI agents a structured, explicit contract for interacting with web pages. Instead of screen-scraping or brittle DOM manipulation, a page declares **tools** that agents can discover, understand via JSON schemas, and invoke programmatically. The result is a clean boundary: the website defines what actions are available and what inputs they expect; the agent calls those tools by name and receives structured output. There are two approaches to implementing WebMCP. The **imperative** approach uses JavaScript (`navigator.modelContext.registerTool()`) and is common in framework-driven apps like Next.js. This guide covers the **declarative** approach, where standard HTML attributes on a `<form>` element are all you need to expose a tool to any WebMCP-aware agent.

---

## 2. The Declarative Approach

The declarative approach turns an ordinary HTML form into an agent-callable tool through a small set of custom attributes. No build step, no framework, no JavaScript registration required. Here is the lifecycle:

1. **Declaration.** You add a `toolname` and `tooldescription` attribute to a `<form>` element. Each input, select, or textarea inside the form gets a `toolparamdescription` attribute. This is the entire declaration surface.

2. **Discovery.** When a WebMCP-aware agent visits the page, the browser exposes all declared tools. The agent sees each tool's name, description, and a JSON schema derived automatically from the form's fields (names, types, constraints like `required`, `minlength`, `<option>` values, etc.).

3. **Invocation.** The agent calls the tool by its `toolname`, passing a JSON object whose keys match the form field `name` attributes. The browser brings the form into focus and populates each field with the agent-supplied values.

4. **Submission.** By default, the form is populated but **not** submitted automatically. The user sees the pre-filled form and clicks Submit themselves. If the `toolautosubmit` attribute is present on the form, submission proceeds automatically after population.

5. **Response.** The form's submit handler can detect that an agent triggered the submission (via `e.agentInvoked`), run validation, and return structured data back to the agent using `e.respondWith()`.

The key insight is that the form itself **is** the tool definition. The browser reads the HTML attributes and synthesizes a tool schema from them. You are annotating what already exists rather than building a parallel API.

---

## 3. HTML Attributes Reference

| Attribute | Placed On | Required | Purpose |
|---|---|---|---|
| `toolname` | `<form>` | Yes | A unique, machine-readable identifier for the tool. Agents call this name to invoke the tool. Use snake_case by convention (e.g., `book_table_le_petit_bistro`). |
| `tooldescription` | `<form>` | Yes | A natural-language description of what the tool does. This is what the agent reads to decide whether this tool is relevant. Be specific about the action and its scope. |
| `toolparamdescription` | `<input>`, `<select>`, `<textarea>` | No (strongly recommended) | A natural-language description of what this particular parameter expects. Supplements the schema information the browser already derives from the field's `type`, `name`, `required`, `min`, `max`, `minlength`, `<option>` values, etc. |
| `toolautosubmit` | `<form>` | No | When present, the form is submitted automatically after the agent populates the fields. Without it, the user must manually confirm and click Submit. Omit this attribute for any action that has side effects the user should review first. |

### How the schema is derived

The browser constructs the tool's JSON schema from the form's native HTML semantics:

- **`name` attribute** on each field becomes the parameter key.
- **`type` attribute** (`text`, `tel`, `date`, `time`, `number`, etc.) informs the parameter type.
- **`required` attribute** marks the parameter as required in the schema.
- **`minlength`, `maxlength`, `min`, `max`, `pattern`** become validation constraints.
- **`<option>` elements** inside a `<select>` define an enum of allowed values.
- **`toolparamdescription`** becomes the human-readable description for that parameter.

You do not write JSON schema by hand. The HTML **is** the schema.

---

## 4. JavaScript Hooks

Three APIs connect your form's runtime logic to the agent lifecycle. These are the only JavaScript surfaces you need to know about.

### `toolactivated` event

```js
window.addEventListener('toolactivated', ({ toolName }) => {
  // Fires when the agent has pre-filled the form fields.
  // toolName is the string from the form's toolname attribute.
  if (toolName !== 'my_tool_name') return;

  // Run any setup logic here: validation, computed defaults, UI updates.
  validateForm();
});
```

**When it fires:** After the agent invokes the tool and the browser has populated the form fields, but before submission. This is your chance to run validation, show warnings, or update dependent UI state based on the populated values.

**Where to listen:** On `window`. The event's `toolName` property tells you which tool was activated, so you can filter if the page has multiple tool-forms.

### `e.agentInvoked` (on the submit event)

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (e.agentInvoked) {
    // This submission was triggered by an AI agent, not a human click.
    // You can return structured data to the agent here.
  }
});
```

**What it is:** A boolean property on the `SubmitEvent` object. It is `true` when the submission was initiated by a WebMCP agent and `false` (or absent) for normal user-initiated submissions.

**Why it matters:** It lets you branch your submit handler. For human users, you might show a modal or redirect. For agents, you return structured data. The same form, the same handler, two paths.

### `e.respondWith()`

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const errors = validateForm();

  if (errors.length > 0) {
    if (e.agentInvoked) {
      e.respondWith(errors); // Send validation errors back to the agent.
    }
    return;
  }

  const result = processBooking();

  if (e.agentInvoked) {
    e.respondWith(result); // Send success data back to the agent.
  }
});
```

**What it does:** Sends a structured response back to the calling agent. Accepts any serializable value: a string, an object, an array, or a `Promise` that resolves to one of those.

**Requirements:** You must call `e.preventDefault()` on the submit event first. If you do not prevent default, the browser handles submission normally and `respondWith` has no effect.

**What to return:** Return whatever the agent needs to understand the outcome. On success, return a confirmation message or result object. On failure, return an array of error objects with enough detail for the agent to correct its inputs and retry.

### `toolcancel` event

```js
window.addEventListener('toolcancel', ({ toolName }) => {
  // The agent (or user) cancelled the tool invocation.
  // Clean up any UI state, reset the form, etc.
});
```

**When it fires:** If the tool invocation is cancelled before submission completes.

---

## 5. CSS Pseudo-classes

WebMCP defines two CSS pseudo-classes for visual feedback during agent interaction. These let you style the form differently when an agent is actively working with it, without any JavaScript.

### `:tool-form-active`

```css
*:tool-form-active {
  outline: none; /* or any styling you want */
}
```

Matches any element that is part of a form currently being interacted with by an agent. Applied from the moment the agent begins populating the form until the interaction completes. Use this to suppress default focus outlines or to apply a subtle visual indicator that an agent is driving the form.

### `:tool-submit-active`

```css
*:tool-submit-active {
  animation: gold-shimmer 3s infinite linear;
  /* Add a badge, border, glow -- anything that says "agent is about to submit" */
}
```

Matches elements during the submission phase of an agent-driven interaction. This is the moment between field population and actual submission. Use this for a more prominent visual signal: a shimmer animation, a "Review & Confirm" badge, a colored border. It tells the user that an AI agent has filled in the form and submission is imminent (or waiting for their confirmation, if `toolautosubmit` is absent).

Both pseudo-classes are opt-in. If you write no CSS rules for them, the form behaves and looks exactly as it always did.

---

## 6. Complete Working Example

Below is a single, self-contained HTML file that implements a contact form as a WebMCP tool. Save it, open it in a WebMCP-aware browser, and an agent can discover and invoke `submit_contact_form`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact Us | WebMCP Demo</title>
  <style>
    /* --- Visual feedback for agent-driven interaction --- */
    *:tool-form-active {
      outline: none;
    }
    *:tool-submit-active {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
      transition: box-shadow 0.3s ease;
    }

    /* --- Basic form styling (not WebMCP-specific) --- */
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 2rem auto; padding: 0 1rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
    input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .error-msg { color: #dc2626; font-size: 0.85rem; display: none; }
    input.invalid { border-color: #dc2626; }
  </style>
</head>
<body>

  <h1>Contact Us</h1>

  <!--
    The form IS the tool.
    toolname:        machine-readable identifier the agent calls
    tooldescription: natural-language explanation for the agent
  -->
  <form
    id="contactForm"
    toolname="submit_contact_form"
    tooldescription="Submits a contact inquiry. Accepts the sender's name, email, a subject category, and a message body."
    novalidate
  >

    <div class="form-group">
      <label for="name">Your Name</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Jane Doe"
        required
        minlength="2"
        toolparamdescription="Full name of the person submitting the inquiry (min 2 characters)"
      />
      <span class="error-msg">Name must be at least 2 characters.</span>
    </div>

    <div class="form-group">
      <label for="email">Email Address</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="jane@example.com"
        required
        toolparamdescription="Email address for follow-up. Must be a valid email format."
      />
      <span class="error-msg">Please enter a valid email address.</span>
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <select
        id="subject"
        name="subject"
        required
        toolparamdescription="Category of the inquiry"
      >
        <option value="general">General Question</option>
        <option value="support">Technical Support</option>
        <option value="billing">Billing</option>
        <option value="partnership">Partnership Opportunity</option>
      </select>
    </div>

    <div class="form-group">
      <label for="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows="4"
        required
        minlength="10"
        placeholder="Tell us what you need help with..."
        toolparamdescription="The body of the inquiry (min 10 characters)"
      ></textarea>
      <span class="error-msg">Message must be at least 10 characters.</span>
    </div>

    <button type="submit">Send Message</button>
  </form>

  <script>
    const form = document.getElementById('contactForm');

    // --- toolactivated: runs after agent populates fields, before submit ---
    window.addEventListener('toolactivated', ({ toolName }) => {
      if (toolName !== 'submit_contact_form') return;
      // Pre-submission validation pass so the agent gets immediate feedback.
      validate();
    });

    // --- Submit handler: serves both humans and agents ---
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errors = validate();

      // If validation failed, report errors.
      if (errors.length > 0) {
        if (e.agentInvoked) {
          e.respondWith(errors);
        }
        return;
      }

      // Build a structured result.
      const result = {
        status: 'received',
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        timestamp: new Date().toISOString(),
      };

      // For agents: return the result object.
      if (e.agentInvoked) {
        e.respondWith(result);
      }

      // For humans: show a simple confirmation.
      alert(`Thanks, ${result.name}! We received your message.`);
      form.reset();
    });

    // --- Validation (details omitted for brevity) ---
    function validate() {
      const errors = [];

      function check(field, condition) {
        const el = form.elements[field];
        const errSpan = el.parentElement.querySelector('.error-msg');
        if (!condition) {
          el.classList.add('invalid');
          if (errSpan) errSpan.style.display = 'block';
          errors.push({ field, value: el.value, message: errSpan?.textContent || 'Invalid' });
        } else {
          el.classList.remove('invalid');
          if (errSpan) errSpan.style.display = 'none';
        }
      }

      check('name', form.elements.name.value.trim().length >= 2);
      check('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements.email.value));
      check('subject', !!form.elements.subject.value);
      check('message', form.elements.message.value.trim().length >= 10);

      return errors;
    }
  </script>

</body>
</html>
```

---

## 7. How an Agent Sees This

When a WebMCP-aware agent loads a page containing the contact form above, the browser exposes a tool that looks approximately like this from the agent's perspective:

```json
{
  "name": "submit_contact_form",
  "description": "Submits a contact inquiry. Accepts the sender's name, email, a subject category, and a message body.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Full name of the person submitting the inquiry (min 2 characters)",
        "minLength": 2
      },
      "email": {
        "type": "string",
        "format": "email",
        "description": "Email address for follow-up. Must be a valid email format."
      },
      "subject": {
        "type": "string",
        "description": "Category of the inquiry",
        "enum": ["general", "support", "billing", "partnership"]
      },
      "message": {
        "type": "string",
        "description": "The body of the inquiry (min 10 characters)",
        "minLength": 10
      }
    },
    "required": ["name", "email", "subject", "message"]
  }
}
```

The agent never parses your HTML to figure this out. The browser reads the form attributes and synthesizes this schema automatically. The agent then calls the tool like any other MCP tool:

```
Tool call: submit_contact_form({
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "support",
  "message": "I cannot log in to my account after resetting my password."
})
```

The browser populates the form fields. If `toolautosubmit` is absent (as above), the form waits for the user to review and click Submit. The submit handler runs, detects `e.agentInvoked === true`, and calls `e.respondWith()` with either validation errors or a success object. The agent receives this structured response and proceeds accordingly.

### The full interaction sequence

```
Agent                          Browser                         Page JS
  |                               |                               |
  |-- discovers tools ----------->|                               |
  |<-- tool schema (from HTML) ---|                               |
  |                               |                               |
  |-- calls submit_contact_form ->|                               |
  |                               |-- populates form fields ----->|
  |                               |-- fires toolactivated ------->|
  |                               |                               |-- runs validate()
  |                               |                               |
  |                               |   [user clicks Submit, or toolautosubmit]
  |                               |                               |
  |                               |-- fires submit event -------->|
  |                               |   (e.agentInvoked = true)     |-- runs handler
  |                               |                               |-- e.respondWith(result)
  |<-- structured result ---------|-------------------------------|
```

---

## 8. Common Pitfalls

### "Duplicate tool name" on page reload

**Symptom.** After adding an imperative `navigator.modelContext.registerTool()` call (e.g. as a polyfill for the declarative attributes), the console shows:

```
InvalidStateError: Failed to execute 'registerTool' on 'ModelContext': Duplicate tool name
```

This repeats on every polling interval and the tool may appear broken.

**Cause.** The WebMCP Bridge extension keeps tool registrations alive in its own process across soft page reloads (⌘R / F5). When the page script runs again, `navigator.modelContext` already holds the tool from the previous load. Calling `registerTool()` with the same name throws instead of overwriting.

**Fix.** Unconditionally call `unregisterTool()` immediately before `registerTool()`. Wrap it in its own try/catch so it does not throw on a fresh load where nothing is registered yet:

```js
try { navigator.modelContext.unregisterTool(form.getAttribute('toolname')); } catch (_) {}
navigator.modelContext.registerTool({ /* ... */ });
```

This is safe on first load (the inner unregister silently fails) and correct on reload (the stale registration is cleared before the new one is added).

---

## Summary

Adding WebMCP to a plain HTML form requires exactly three things:

1. **Two attributes on the `<form>`**: `toolname` and `tooldescription`.
2. **One attribute on each field**: `toolparamdescription` (the browser derives the rest from standard HTML).
3. **A submit handler that checks `e.agentInvoked`** and calls `e.respondWith()` to return data to the agent.

Everything else -- `toolautosubmit`, the CSS pseudo-classes, the `toolactivated` event -- is optional and additive. The minimal surface is small by design: annotate what you already have, and your form becomes a tool.
