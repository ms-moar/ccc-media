# Adding WebMCP to a Next.js / React App: The Imperative Approach

An architecture-level implementation guide for exposing structured AI-agent tools from your frontend using the WebMCP imperative API.

---

## 1. What is WebMCP?

WebMCP is a proposed web standard that gives AI agents an explicit, structured contract for interacting with websites. Instead of screen-scraping or brittle DOM selectors, a WebMCP-enabled page exposes *tools* -- each with a name, a JSON Schema describing its inputs and outputs, and an executable function -- through a browser-native API surface (`navigator.modelContext`). An agent connecting to the page discovers exactly which actions are available, what parameters they accept, and whether they are read-only or mutating. The result is a reliable, self-documenting interface between any AI agent and any web application.

---

## 2. The Imperative Approach

The imperative approach is one of the ways a site can surface WebMCP tools. It works like this:

1. **Define tool objects** in JavaScript/TypeScript. Each tool object carries a `name`, a `description`, an `inputSchema` (JSON Schema), an `outputSchema`, an `execute` function, and optional `annotations`.
2. **Register tools** with `navigator.modelContext.registerTool(toolObject)` when the relevant UI is on screen.
3. **Unregister tools** with `navigator.modelContext.unregisterTool(toolName)` when the relevant UI leaves the screen.
4. When an agent invokes a tool, the browser calls the tool's `execute` function. That function must coordinate with your app's state, perform the action, wait for the UI to settle, and return a result string (or structured data) to the agent.

The key insight: **tools are dynamic**. They appear and disappear as the user (or agent) navigates your app. A search page offers search tools. A results page offers filter and listing tools. A cart page offers cart-management tools. The agent always sees exactly the tools that make sense for the current view.

---

## 3. Architecture Overview

Here is how the imperative approach fits into a React / Next.js application:

```
┌─────────────────────────────────────────────────────────┐
│  Browser (navigator.modelContext)                       │
│                                                         │
│  ┌───────────────┐    registers/     ┌───────────────┐  │
│  │  AI Agent      │◄──unregisters───│  webmcp.ts     │  │
│  │  (Claude, etc) │    tools         │  (tool defs +  │  │
│  │                │                  │   execute fns) │  │
│  │  calls execute─┼─────────────────►│                │  │
│  └───────────────┘                  └───────┬───────┘  │
│                                             │           │
│                              CustomEvent    │           │
│                              dispatch       │           │
│                                             ▼           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Component Tree                            │   │
│  │                                                  │   │
│  │  ┌────────────┐   ┌────────────┐                 │   │
│  │  │ /products  │   │ /cart      │                 │   │
│  │  │ useEffect: │   │ useEffect: │                 │   │
│  │  │  register  │   │  register  │                 │   │
│  │  │  search    │   │  viewCart  │                 │   │
│  │  │  tools     │   │  remove   │                 │   │
│  │  │            │   │  tools    │                 │   │
│  │  │ listens to │   │ listens to│                 │   │
│  │  │ CustomEvent│   │ CustomEvent│                │   │
│  │  │ + signals  │   │ + signals │                 │   │
│  │  │ completion │   │ completion│                 │   │
│  │  └────────────┘   └────────────┘                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### The four architectural layers

**Layer 1 -- `webmcp.ts` (the integration module).** A single file that holds every tool definition, every `execute` function, the `dispatchAndWait` bridge, and the register/unregister helper functions. This file is the only place that touches `navigator.modelContext`. Nothing in your React components needs to know about the WebMCP API directly.

**Layer 2 -- `useEffect` registration hooks in page components.** Each page component calls the appropriate `register*Tools()` on mount and `unregister*Tools()` on cleanup. This is the only coupling between your UI layer and `webmcp.ts`.

**Layer 3 -- The CustomEvent bridge.** Tool `execute` functions cannot directly call React state setters (they run outside the React tree). Instead, they dispatch a `CustomEvent` on `window`, carrying the tool parameters plus a unique `requestId`. The React component listens for that event, performs the state update, and then dispatches a completion event (`tool-completion-{requestId}`) so the execute function knows the UI has settled.

**Layer 4 -- The `completedRequestId` pattern.** A piece of React state that, when set, triggers a `useEffect` to fire the completion event. This guarantees the completion signal fires *after* React has re-rendered with the new state, not before.

---

## 4. Tool Definition Anatomy

Every tool registered with `navigator.modelContext.registerTool()` is a plain object with these fields:

```typescript
const myTool = {
  name: "searchProducts",
  // Unique identifier. Agents call tools by this name.
  // Also used as the argument to unregisterTool().

  description: "Searches for products matching a query string.",
  // Natural-language description. This is what the agent reads to decide
  // whether and how to use the tool. Be specific and unambiguous.

  execute: async (params: Record<string, unknown>) => string | object,
  // The function the browser invokes when an agent calls this tool.
  // Receives validated parameters. Must return a result (string or object)
  // AFTER the UI has finished updating. This is where you dispatch
  // CustomEvents and await completion.

  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      maxResults: { type: "number", description: "Max results to return" },
    },
    required: ["query"],
  },
  // Standard JSON Schema describing every parameter the tool accepts.
  // The agent uses this to construct valid calls. Be generous with
  // descriptions on each property -- the agent reads them.

  outputSchema: {
    type: "string",
  },
  // JSON Schema describing what execute() returns. Helps the agent
  // interpret the response.

  annotations: {
    readOnlyHint: "true",   // or "false"
  },
  // Metadata hints for the agent. readOnlyHint tells the agent whether
  // calling this tool will mutate state. Agents can use this to decide
  // whether to ask for confirmation before invoking.
};
```

### Guidelines for good tool definitions

- **`name`**: Use camelCase verbs that match your domain (`searchProducts`, `addToCart`, `removeFromCart`). These become the tool names the agent sees.
- **`description`**: Write this as if explaining the tool to a colleague. Include what it does, any important constraints, and what the return value represents.
- **`inputSchema`**: Every property should have a `description`. Use `required` to distinguish mandatory from optional parameters. Use `enum` for constrained values.
- **`annotations.readOnlyHint`**: Set to `"true"` for tools that only read data (`listFlights`, `viewCart`). Set to `"false"` for tools that change state (`setFilters`, `removeFromCart`). Agents may use this to decide whether to proceed without confirmation.

---

## 5. Contextual Tool Loading

This is the most important architectural pattern in a WebMCP-enabled SPA. Tools are not globally registered at app startup. They are **registered when a component mounts and unregistered when it unmounts**. This means the set of available tools always reflects the current page.

### Why this matters

An agent interacting with an e-commerce site should not see a `removeFromCart` tool when the user is on the product search page -- there is no cart UI visible, and invoking that tool would make no sense. Conversely, once the user navigates to the cart, the `searchProducts` tool may no longer be relevant.

By tying registration to component lifecycle, you get this for free:

```
User on /products  -->  Agent sees: searchProducts
User on /cart      -->  Agent sees: viewCart, removeFromCart
User on /checkout  -->  Agent sees: placeOrder, applyCoupon
```

### The pattern in code

```tsx
// app/products/page.tsx
"use client";

import { useEffect } from "react";
import {
  registerProductTools,
  unregisterProductTools,
} from "@/lib/webmcp";

export default function ProductsPage() {
  useEffect(() => {
    registerProductTools();       // Tools become visible to the agent

    return () => {
      unregisterProductTools();   // Tools disappear from the agent's view
    };
  }, []);

  return <div>{/* product search UI */}</div>;
}
```

### Handling duplicate registration

When multiple components on the same page might register the same tool, use a tracking map to prevent double-registration:

```typescript
const registeredTools: Record<string, boolean> = {
  searchProducts: false,
  viewCart: false,
  removeFromCart: false,
};

export function registerCartTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  if (!registeredTools.viewCart) {
    mc.registerTool(viewCartTool);
    registeredTools.viewCart = true;
  }
  if (!registeredTools.removeFromCart) {
    mc.registerTool(removeFromCartTool);
    registeredTools.removeFromCart = true;
  }
}

export function unregisterCartTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  mc.unregisterTool("viewCart");
  mc.unregisterTool("removeFromCart");
  registeredTools.viewCart = false;
  registeredTools.removeFromCart = false;
}
```

---

## 6. The Event Bridge Pattern

The central engineering challenge: a tool's `execute` function runs in `webmcp.ts`, outside the React component tree. It has no access to state setters, hooks, or the router. But it needs to trigger a state change in React, wait for React to re-render, and then return a result to the agent.

The solution is a three-part bridge built on `CustomEvent` and `window` event listeners.

### Part 1: `dispatchAndWait` (in webmcp.ts)

```typescript
function dispatchAndWait(
  eventName: string,
  detail: Record<string, unknown> = {},
  successMessage: string = "Action completed successfully",
  timeoutMs: number = 5000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Generate a unique request ID
    const requestId = Math.random().toString(36).substring(2, 15);
    const completionEventName = `tool-completion-${requestId}`;

    // 2. Set up a timeout in case the component never signals completion
    const timeoutId = setTimeout(() => {
      window.removeEventListener(completionEventName, handleCompletion);
      reject(new Error("Timed out waiting for UI to update"));
    }, timeoutMs);

    // 3. Listen for the component's completion signal
    const handleCompletion = () => {
      clearTimeout(timeoutId);
      window.removeEventListener(completionEventName, handleCompletion);
      resolve(successMessage);
    };
    window.addEventListener(completionEventName, handleCompletion);

    // 4. Dispatch the action event to the React component
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { ...detail, requestId },
      }),
    );
  });
}
```

A tool's `execute` function calls `dispatchAndWait`:

```typescript
async function searchProducts(params: Record<string, unknown>): Promise<string> {
  return dispatchAndWait("searchProducts", params, "Search completed");
}
```

### Part 2: Event listener in the React component

The component listens for the custom event, performs the state change, and stores the `requestId`:

```tsx
useEffect(() => {
  const handleSearch = (event: CustomEvent) => {
    const { requestId, ...params } = event.detail;

    // Perform the state update
    setSearchQuery(params.query as string);
    // Or trigger navigation, API calls, etc.

    // Store the requestId so we can signal completion after render
    if (requestId) setCompletedRequestId(requestId);
  };

  window.addEventListener("searchProducts", handleSearch as EventListener);
  return () => {
    window.removeEventListener("searchProducts", handleSearch as EventListener);
  };
}, []);
```

### Part 3: Completion signal after render

A separate `useEffect` watches `completedRequestId` and fires the completion event *after* React has committed the new state to the DOM:

```tsx
const [completedRequestId, setCompletedRequestId] = useState<string | null>(null);

useEffect(() => {
  if (completedRequestId) {
    // This runs AFTER React has re-rendered with the new state
    window.dispatchEvent(new CustomEvent(`tool-completion-${completedRequestId}`));
    setCompletedRequestId(null);
  }
}, [completedRequestId]);
```

### Why not signal completion immediately?

If you dispatch the completion event inside the event handler (before React re-renders), the agent will receive its response before the UI has actually updated. The agent might then try to read data from the page and get stale content. The `completedRequestId` pattern guarantees the completion signal fires in a `useEffect` -- which runs after React has committed the update to the DOM.

### The full flow

```
Agent calls tool "searchProducts" with {query: "laptop"}
  │
  ▼
execute("searchProducts", {query: "laptop"}) in webmcp.ts
  │
  ├── generates requestId = "abc123"
  ├── listens for "tool-completion-abc123"
  ├── dispatches CustomEvent("searchProducts", {query: "laptop", requestId: "abc123"})
  │
  ▼
React component receives CustomEvent
  │
  ├── calls setSearchQuery("laptop")
  ├── calls setCompletedRequestId("abc123")
  │
  ▼
React re-renders with new search results
  │
  ▼
useEffect fires (completedRequestId === "abc123")
  │
  ├── dispatches CustomEvent("tool-completion-abc123")
  ├── calls setCompletedRequestId(null)
  │
  ▼
dispatchAndWait resolves with "Search completed"
  │
  ▼
Agent receives result: "Search completed"
```

---

## 7. Complete Working Example

A Next.js 14+ App Router application with two pages: **Products** (search) and **Cart** (view/remove). Tools appear and disappear as you navigate.

### File structure

```
app/
├── layout.tsx          # Root layout with navigation
├── products/
│   └── page.tsx        # Product search page
├── cart/
│   └── page.tsx        # Cart page
lib/
└── webmcp.ts           # All tool definitions, execute fns, registration
```

---

### `lib/webmcp.ts`

```typescript
// ---------------------------------------------------------------------------
// Type declaration for the WebMCP browser API
// ---------------------------------------------------------------------------
declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: object) => void;
      unregisterTool: (name: string) => void;
    };
  }
}

// ---------------------------------------------------------------------------
// Registration tracking (prevents double-registration)
// ---------------------------------------------------------------------------
const registeredTools: Record<string, boolean> = {
  searchProducts: false,
  viewCart: false,
  removeFromCart: false,
};

// ---------------------------------------------------------------------------
// The event bridge: dispatch a CustomEvent and wait for the component
// to signal completion via a matching "tool-completion-{requestId}" event
// ---------------------------------------------------------------------------
function dispatchAndWait(
  eventName: string,
  detail: Record<string, unknown> = {},
  successMessage: string = "Action completed successfully",
  timeoutMs: number = 5000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).substring(2, 15);
    const completionEventName = `tool-completion-${requestId}`;

    const timeoutId = setTimeout(() => {
      window.removeEventListener(completionEventName, handleCompletion);
      reject(new Error("Timed out waiting for UI to update"));
    }, timeoutMs);

    const handleCompletion = () => {
      clearTimeout(timeoutId);
      window.removeEventListener(completionEventName, handleCompletion);
      resolve(successMessage);
    };

    window.addEventListener(completionEventName, handleCompletion);

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { ...detail, requestId },
      }),
    );
  });
}

// ---------------------------------------------------------------------------
// Execute functions (called by the browser when an agent invokes a tool)
// ---------------------------------------------------------------------------
async function searchProducts(params: Record<string, unknown>): Promise<string> {
  return dispatchAndWait(
    "searchProducts",
    params,
    "Product search completed. Results are now displayed on the page.",
  );
}

async function viewCart(): Promise<string> {
  return dispatchAndWait(
    "viewCart",
    {},
    "Cart contents retrieved.",
    3000,
  );
}

async function removeFromCart(params: Record<string, unknown>): Promise<string> {
  return dispatchAndWait(
    "removeFromCart",
    params,
    `Item "${params.productId}" removed from cart.`,
  );
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
export const searchProductsTool = {
  name: "searchProducts",
  description:
    "Searches for products matching a query. Updates the product listing on the page with matching results.",
  execute: searchProducts,
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find products by name or category.",
      },
      maxPrice: {
        type: "number",
        description: "Optional maximum price filter.",
      },
      category: {
        type: "string",
        enum: ["electronics", "clothing", "books", "home"],
        description: "Optional category filter.",
      },
    },
    required: ["query"],
  },
  outputSchema: {
    type: "string",
    description: "A confirmation message indicating search results are displayed.",
  },
  annotations: {
    readOnlyHint: "false",
  },
};

export const viewCartTool = {
  name: "viewCart",
  description:
    "Returns the current contents of the shopping cart, including item names, quantities, and prices.",
  execute: viewCart,
  inputSchema: {},
  outputSchema: {
    type: "string",
    description: "A confirmation that cart contents are displayed.",
  },
  annotations: {
    readOnlyHint: "true",
  },
};

export const removeFromCartTool = {
  name: "removeFromCart",
  description:
    "Removes an item from the shopping cart by its product ID. The cart display updates automatically.",
  execute: removeFromCart,
  inputSchema: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        description: "The unique identifier of the product to remove.",
      },
    },
    required: ["productId"],
  },
  outputSchema: {
    type: "string",
    description: "Confirmation that the item was removed.",
  },
  annotations: {
    readOnlyHint: "false",
  },
};

// ---------------------------------------------------------------------------
// Registration functions -- called from useEffect in page components
// ---------------------------------------------------------------------------
export function registerProductTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  if (!registeredTools.searchProducts) {
    mc.registerTool(searchProductsTool);
    registeredTools.searchProducts = true;
  }
}

export function unregisterProductTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  mc.unregisterTool(searchProductsTool.name);
  registeredTools.searchProducts = false;
}

export function registerCartTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  if (!registeredTools.viewCart) {
    mc.registerTool(viewCartTool);
    registeredTools.viewCart = true;
  }
  if (!registeredTools.removeFromCart) {
    mc.registerTool(removeFromCartTool);
    registeredTools.removeFromCart = true;
  }
}

export function unregisterCartTools() {
  const mc = navigator.modelContext;
  if (!mc) return;

  mc.unregisterTool(viewCartTool.name);
  mc.unregisterTool(removeFromCartTool.name);
  registeredTools.viewCart = false;
  registeredTools.removeFromCart = false;
}
```

---

### `app/layout.tsx`

```tsx
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

---

### `app/products/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { registerProductTools, unregisterProductTools } from "@/lib/webmcp";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Simulated product catalog
const PRODUCTS: Product[] = [
  { id: "1", name: "Laptop Pro 16", price: 1299, category: "electronics" },
  { id: "2", name: "Wireless Headphones", price: 199, category: "electronics" },
  { id: "3", name: "TypeScript Handbook", price: 39, category: "books" },
  { id: "4", name: "Cotton T-Shirt", price: 25, category: "clothing" },
  { id: "5", name: "Desk Lamp", price: 75, category: "home" },
];

export default function ProductsPage() {
  const [results, setResults] = useState<Product[]>(PRODUCTS);
  const [query, setQuery] = useState("");
  const [completedRequestId, setCompletedRequestId] = useState<string | null>(null);

  // --- Completion signal: fires AFTER React re-renders ---
  useEffect(() => {
    if (completedRequestId) {
      window.dispatchEvent(new CustomEvent(`tool-completion-${completedRequestId}`));
      setCompletedRequestId(null);
    }
  }, [completedRequestId]);

  // --- Register tools + listen for events ---
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const { requestId, query: q, maxPrice, category } = (event as CustomEvent).detail;

      let filtered = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes((q as string).toLowerCase()),
      );
      if (maxPrice) filtered = filtered.filter((p) => p.price <= maxPrice);
      if (category) filtered = filtered.filter((p) => p.category === category);

      setQuery(q as string);
      setResults(filtered);
      if (requestId) setCompletedRequestId(requestId);
    };

    window.addEventListener("searchProducts", handleSearch);
    registerProductTools();

    return () => {
      window.removeEventListener("searchProducts", handleSearch);
      unregisterProductTools();
    };
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <input
        type="text"
        value={query}
        placeholder="Search products..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price} ({p.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### `app/cart/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { registerCartTools, unregisterCartTools } from "@/lib/webmcp";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Simulated cart state (in a real app this would come from a store or API)
const INITIAL_CART: CartItem[] = [
  { productId: "1", name: "Laptop Pro 16", price: 1299, quantity: 1 },
  { productId: "3", name: "TypeScript Handbook", price: 39, quantity: 2 },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [completedRequestId, setCompletedRequestId] = useState<string | null>(null);

  // --- Completion signal ---
  useEffect(() => {
    if (completedRequestId) {
      window.dispatchEvent(new CustomEvent(`tool-completion-${completedRequestId}`));
      setCompletedRequestId(null);
    }
  }, [completedRequestId]);

  // --- Register tools + listen for events ---
  useEffect(() => {
    const handleViewCart = (event: Event) => {
      const { requestId } = (event as CustomEvent).detail;
      // No state change needed -- cart is already displayed.
      // Just signal completion.
      if (requestId) setCompletedRequestId(requestId);
    };

    const handleRemove = (event: Event) => {
      const { requestId, productId } = (event as CustomEvent).detail;
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      if (requestId) setCompletedRequestId(requestId);
    };

    window.addEventListener("viewCart", handleViewCart);
    window.addEventListener("removeFromCart", handleRemove);
    registerCartTools();

    return () => {
      window.removeEventListener("viewCart", handleViewCart);
      window.removeEventListener("removeFromCart", handleRemove);
      unregisterCartTools();
    };
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.productId}>
                {item.name} x{item.quantity} - ${item.price * item.quantity}
                <button onClick={() => setCart((c) => c.filter((i) => i.productId !== item.productId))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>Total: ${total}</p>
        </>
      )}
    </div>
  );
}
```

---

## 8. How an Agent Sees This

An AI agent connected to this app through a WebMCP bridge (such as the Claude Code WebMCP extension) experiences the application as a changing set of MCP tools. Here is what that looks like at each step:

### Step 1 -- Agent connects while user is on `/products`

The agent discovers one tool:

```
Available tools:
  - searchProducts
      Description: "Searches for products matching a query. Updates the
                    product listing on the page with matching results."
      Input schema:
        query (string, required): "The search query to find products by name or category."
        maxPrice (number, optional): "Optional maximum price filter."
        category (string, optional, enum): "Optional category filter."
      Annotations: readOnlyHint = false
```

The agent knows it can search products. It does *not* see any cart tools because the cart page component has not mounted.

### Step 2 -- Agent invokes `searchProducts`

```
Agent calls: searchProducts({ query: "laptop", maxPrice: 1500 })

  1. Browser calls the tool's execute function
  2. execute dispatches CustomEvent("searchProducts", { query: "laptop", maxPrice: 1500, requestId: "x7k9m" })
  3. React component receives the event, filters products, re-renders
  4. useEffect fires tool-completion-x7k9m
  5. execute resolves

Agent receives: "Product search completed. Results are now displayed on the page."
```

The agent can now read the page to see the filtered results.

### Step 3 -- User navigates to `/cart`

The products page unmounts, calling `unregisterProductTools()`. The cart page mounts, calling `registerCartTools()`. The agent's tool set changes:

```
Available tools:
  - viewCart
      Description: "Returns the current contents of the shopping cart..."
      Annotations: readOnlyHint = true

  - removeFromCart
      Description: "Removes an item from the shopping cart by its product ID..."
      Input schema:
        productId (string, required): "The unique identifier of the product to remove."
      Annotations: readOnlyHint = false
```

The `searchProducts` tool is gone. Two new tools have appeared. The agent adapts its behavior accordingly.

### Step 4 -- Agent invokes `removeFromCart`

```
Agent calls: removeFromCart({ productId: "3" })

Agent receives: 'Item "3" removed from cart.'
```

The TypeScript Handbook disappears from the cart UI. The agent can verify by reading the page content.

### Step 5 -- User navigates back to `/products`

Cart tools disappear. `searchProducts` reappears. The cycle continues.

### What the agent never sees

- Internal implementation details (CustomEvents, requestIds, the bridge mechanism)
- Tools for pages the user is not currently viewing
- React state, hooks, or component structure

The agent sees a clean, stable MCP tool interface that adapts to context. That is the entire point of WebMCP.

---

## Summary: What Goes Where and Why

| Concern | Where it lives | Why |
|---|---|---|
| Tool definitions (name, schema, annotations) | `lib/webmcp.ts` | Single source of truth; easy to audit all tools in one file |
| Execute functions | `lib/webmcp.ts` | They use `dispatchAndWait` which is defined here |
| `dispatchAndWait` bridge | `lib/webmcp.ts` | Encapsulates the CustomEvent + requestId protocol |
| `registerTool` / `unregisterTool` calls | `lib/webmcp.ts` (exported helpers) | Isolates `navigator.modelContext` access to one module |
| Registration lifecycle | Page component `useEffect` | Ties tool availability to component mount/unmount |
| Event listeners for tool actions | Page component `useEffect` | Component has access to state setters and router |
| `completedRequestId` state + effect | Page component | Ensures completion fires after React re-render |
| `navigator.modelContext` type declaration | `lib/webmcp.ts` (global augmentation) | Needed for TypeScript; only declared once |

The reader should now know exactly where to put each piece when adding WebMCP to any Next.js or React application. Define your tools in a central module. Register them in `useEffect`. Bridge execution through CustomEvents. Signal completion after render. The agent gets a contextual, self-documenting interface that changes with the page.
