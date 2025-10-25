
/// <reference types="react-scripts" />

// Add this to allow TypeScript to understand CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
