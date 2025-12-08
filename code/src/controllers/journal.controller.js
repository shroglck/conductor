/**
 * ============================================================================
 * Journal Controller
 * ============================================================================
 *
 * File: code/src/controllers/journal.controller.js
 *
 * This controller handles the Personal Journal feature.
 *
 * ============================================================================
 */

import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
    createJournalPage,
    createJournalList,
    createJournalEntryCard
} from "../utils/htmx-templates/journal-templates.js";
import { createBaseLayout, createErrorMessage } from "../utils/html-templates.js";

/**
 * Get Journal Page
 * Route: GET /journal
 */
export const getJournalPage = asyncHandler(async (req, res) => {
    const user = req.user;
    const { type } = req.query;

    // Filter by type if provided (WORK_LOG, EMOTIONAL_REFLECTION)
    const where = {
        userId: user.id
    };
    if (type) {
        where.entryType = type;
    }

    const entries = await prisma.journalEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    const pageContent = createJournalPage(user, entries, type);

    // Check if HTMX request (for filters or partial loads) - though main nav usually full load
    // But filters might use HTMX.
    if (req.headers["hx-request"]) {
        // If it's a specific filter request targeting the list container
        if (req.headers["hx-target"] === "journal-list-container") {
            return res.send(createJournalList(entries));
        }
        // Otherwise return partial page content
        return res.send(pageContent);
    }

    const fullHtml = createBaseLayout("Journal", pageContent, { user });
    res.send(fullHtml);
});

/**
 * Create Journal Entry
 * Route: POST /journal
 */
export const createJournalEntry = asyncHandler(async (req, res) => {
    const user = req.user;
    const { entryType, content, title, mood } = req.body;

    if (!entryType || !content) {
        return res.status(400).send(createErrorMessage("Entry type and content are required."));
    }

    const newEntry = await prisma.journalEntry.create({
        data: {
            userId: user.id,
            entryType,
            content,
            title: title || null,
            mood: mood || null,
        }
    });

    // If request comes from dashboard modal (or other partial context), we might want to return a toast or updated list.
    // If it comes from the journal page list, we want to prepend the new entry.

    if (req.headers["hx-request"]) {
        // If the request targets the journal list (from Journal Page), return the new card HTML.
        // The frontend uses hx-target="#journal-list-container" and hx-swap="afterbegin".
        if (req.headers["hx-target"] === "journal-list-container") {
            return res.send(createJournalEntryCard(newEntry));
        }

        // If from Dashboard Modal (or other sources where we don't need the HTML back),
        // we just return 200 OK. The frontend handles the UI (toast, close modal) via events.
        return res.status(200).send("");
    }

    // Fallback redirect
    res.redirect("/journal");
});

/**
 * Update Journal Entry
 * Route: PUT /journal/:id
 */
export const updateJournalEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const { content, title, mood } = req.body;

    const entry = await prisma.journalEntry.findUnique({
        where: { id }
    });

    if (!entry || entry.userId !== user.id) {
        return res.status(404).send(createErrorMessage("Entry not found or unauthorized."));
    }

    const updateData = {
        content,
        title: title || null,
        isEdited: true
    };

    if (mood !== undefined) {
        updateData.mood = mood || null;
    }

    await prisma.journalEntry.update({
        where: { id },
        data: updateData
    });

    // Return updated card HTML so HTMX can replace the old one
    const updatedEntry = await prisma.journalEntry.findUnique({ where: { id } });

    res.set("HX-Trigger", "journalEntryUpdated");
    res.send(createJournalEntryCard(updatedEntry));
});

/**
 * Delete Journal Entry
 * Route: DELETE /journal/:id
 */
export const deleteJournalEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const entry = await prisma.journalEntry.findUnique({
        where: { id }
    });

    if (!entry || entry.userId !== user.id) {
        return res.status(404).send(createErrorMessage("Entry not found or unauthorized."));
    }

    await prisma.journalEntry.delete({
        where: { id }
    });

    // Return empty string to remove element from DOM
    res.send("");
});
