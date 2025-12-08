# Testing the Personal Journal Feature

## 1. Prerequisites
- Ensure the application is running (`npm start` or `npm run dev`).
- Ensure you have a user account (login via Google Auth or use a seeded user if in dev mode).
- Ensure the database is migrated (`npx prisma migrate dev`).

## 2. Navigation
- Log in to the application.
- Locate the sidebar navigation.
- Click on "Account" to expand the sub-menu (if collapsed).
- Click on "Journal".
- **Expected:** You should land on the `/journal` page. The header "Journal" and subtitle "Document your work and reflections" should be visible.

## 3. Creating Entries
### Work Log
- On the Journal page, ensure "Work Log" is selected (default).
- Enter content in the text area (e.g., "Worked on API integration").
- Click "Post Entry".
- **Expected:** The new entry should appear immediately at the top of the list with a "Work Log" badge and the current timestamp. The editor should reset.

### Emotional Reflection
- Select "Reflection" in the type selector.
- A "Mood" selector should appear.
- Select a mood (e.g., "Happy").
- Enter content (e.g., "Feeling great about progress").
- Click "Post Entry".
- **Expected:** The entry appears at the top with a "Reflection" badge and a small mood indicator (e.g., "Happy").

## 4. Editing Entries
- Hover over an existing entry.
- Click the "Edit" (pencil) icon.
- The entry content should be replaced by an inline edit form.
- Modify the text.
- Click "Save".
- **Expected:** The form disappears, and the updated content is shown with an "(edited)" badge.

## 5. Deleting Entries
- Hover over an entry.
- Click the "Delete" (trash) icon.
- **Expected:** You might see a confirmation dialog. Upon confirmation, the entry is removed from the list immediately.

## 6. Dashboard Integration
- Go to the Dashboard (`/`).
- Click the "Work Journal" button in the "Actions" card.
- A modal appears.
- Enter content and select a mood.
- Click "Save Entry".
- **Expected:** The modal closes, and a success toast ("Journal entry saved") appears.
- **Verify:** Navigate back to the Journal page. The entry you created from the dashboard should be listed.

## 7. Filtering
- On the Journal page, click "Work Logs" filter button.
- **Expected:** Only Work Log entries are shown.
- Click "Reflections".
- **Expected:** Only Reflection entries are shown.
- Click "All".
- **Expected:** All entries are shown.
