# AI Development Rules for Vigil

This document provides guidelines for the AI assistant to follow when developing and modifying the Vigil application. The goal is to maintain a consistent, simple, and maintainable codebase.

## Tech Stack

The application is built with a modern, lightweight tech stack. Here are the key technologies:

-   **Framework:** React with TypeScript for building the user interface.
-   **Build Tool:** Vite is used for a fast and efficient development experience.
-   **Styling:** All styling is done using Tailwind CSS. It's configured directly in `index.html` and used for utility-first styling within components.
-   **Component Architecture:** The application uses custom-built React components located in `src/components`. There are no third-party UI libraries like Shadcn/UI or Material-UI.
-   **State Management:** State is managed primarily with React Hooks (`useState`, `useEffect`). Global state is handled via React Context (e.g., `ThemeContext`).
-   **Routing:** A custom, component-based routing system is implemented within `App.tsx`. It does not use an external library like React Router.
-   **Icons:** Icons are custom SVGs embedded within reusable React components (e.g., `components/icons/Icon.tsx`).
-   **Data:** The application currently uses mock data from `src/constants.ts` to simulate a backend.

## Library and Coding Rules

To ensure consistency, please adhere to the following rules:

1.  **Styling:**
    -   **ALWAYS** use Tailwind CSS classes for all styling.
    -   **DO NOT** create separate `.css` or `.scss` files.
    -   **DO NOT** use inline `style` attributes unless absolutely necessary for dynamic properties that cannot be handled by Tailwind.

2.  **UI Components:**
    -   **ALWAYS** build new UI elements as custom components within the `src/components` directory.
    -   **REUSE** existing components like `Card.tsx`, `Avatar.tsx`, and `Button.tsx` whenever possible.
    -   **DO NOT** install or use any third-party UI component libraries (e.g., Material-UI, Ant Design, Chakra UI, Shadcn/UI).

3.  **Icons:**
    -   **ALWAYS** use the existing `Icon.tsx` component for creating new icons.
    -   To add a new icon, create a new component that renders `<Icon>` with the appropriate SVG `<path>` or other SVG elements as children.
    -   **DO NOT** install any icon libraries like `lucide-react` or `react-icons`.

4.  **State Management:**
    -   **PREFER** local component state using `useState` for state that is not shared.
    -   **USE** React Context for simple global state that is shared across the application (like the current theme).
    -   **DO NOT** add complex state management libraries like Redux, MobX, or Zustand.

5.  **Routing:**
    -   **CONTINUE** to use the existing routing logic managed in `App.tsx`.
    -   **DO NOT** add `react-router-dom` or any other routing library.

6.  **Dependencies:**
    -   **AVOID** adding new third-party dependencies unless they provide critical functionality that is not feasible to build from scratch. The goal is to keep the application lightweight.