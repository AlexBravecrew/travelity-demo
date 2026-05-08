// Note: Astro pages can also import the .tsx files directly. This barrel
// is for symmetry with the rest of the codebase, and exposes the schema
// for any consumer that needs the typed validation contract.
export { default as BookDemoForm } from './BookDemoForm';
export { default as BookDemoSuccess } from './BookDemoSuccess';
export {
    bookDemoSchema,
    type BookDemoFormValues,
    TEAM_SIZE_OPTIONS,
    BUSINESS_TYPE_OPTIONS,
} from './book-demo-schema';
