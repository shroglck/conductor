
import { jest } from '@jest/globals';
import request from 'supertest';
import { prisma } from '../src/lib/prisma.js';
import { createApp } from '../src/app.js';
import { generateToken } from './utils/auth.test.helper.js';

describe('Journal Feature', () => {
    let app;
    let userId;
    let token;

    beforeAll(async () => {
        app = createApp();
        // Create a test user
        const user = await prisma.user.create({
            data: {
                email: 'journaltest@test.com',
                name: 'Journal Test User',
            }
        });
        userId = user.id;
        token = generateToken(user);
    });

    afterAll(async () => {
        // Cleanup
        await prisma.journalEntry.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.journalEntry.deleteMany({ where: { userId } });
    });

    describe('POST /journal', () => {
        it('should create a new journal entry', async () => {
            const res = await request(app)
                .post('/journal')
                .set('Cookie', [`auth_token=${token}`])
                .send({
                    entryType: 'WORK_LOG',
                    content: 'This is a test entry',
                    title: 'Test Title'
                });

            expect(res.status).toBe(302); // Redirects to /journal

            const entry = await prisma.journalEntry.findFirst({
                where: { userId }
            });
            expect(entry).toBeTruthy();
            expect(entry.content).toBe('This is a test entry');
            expect(entry.entryType).toBe('WORK_LOG');
        });

        it('should handle HTMX request from Dashboard (no HTML return)', async () => {
            const res = await request(app)
                .post('/journal')
                .set('Cookie', [`auth_token=${token}`])
                .set('HX-Request', 'true')
                // No HX-Target implied or different target
                .send({
                    entryType: 'EMOTIONAL_REFLECTION',
                    content: 'Feeling good',
                    mood: 'Happy'
                });

            expect(res.status).toBe(200);
            expect(res.text).toBe(""); // Expect empty response for dashboard modal

            const entry = await prisma.journalEntry.findFirst({
                where: { userId, entryType: 'EMOTIONAL_REFLECTION' }
            });
            expect(entry).toBeTruthy();
            expect(entry.mood).toBe('Happy');
        });

        it('should handle HTMX request from Journal List (HTML return)', async () => {
            const res = await request(app)
                .post('/journal')
                .set('Cookie', [`auth_token=${token}`])
                .set('HX-Request', 'true')
                .set('HX-Target', 'journal-list-container') // Targeting the list
                .send({
                    entryType: 'WORK_LOG',
                    content: 'List update entry'
                });

            expect(res.status).toBe(200);
            expect(res.text).toContain('<div class="journal-card"'); // Expect HTML card
            expect(res.text).toContain('List update entry');
        });
    });

    describe('GET /journal', () => {
        it('should get journal page', async () => {
            // Create some entries
            await prisma.journalEntry.create({
                data: {
                    userId,
                    entryType: 'WORK_LOG',
                    content: 'Entry 1'
                }
            });

            const res = await request(app)
                .get('/journal')
                .set('Cookie', [`auth_token=${token}`]);

            expect(res.status).toBe(200);
            expect(res.text).toContain('Journal');
            expect(res.text).toContain('Entry 1');
        });

        it('should filter entries by type', async () => {
            await prisma.journalEntry.createMany({
                data: [
                    { userId, entryType: 'WORK_LOG', content: 'Work Log 1' },
                    { userId, entryType: 'EMOTIONAL_REFLECTION', content: 'Reflection 1' }
                ]
            });

            const res = await request(app)
                .get('/journal?type=WORK_LOG')
                .set('Cookie', [`auth_token=${token}`]);

            expect(res.status).toBe(200);
            expect(res.text).toContain('Work Log 1');
            expect(res.text).not.toContain('Reflection 1');
        });
    });

    describe('PUT /journal/:id', () => {
        it('should update an entry', async () => {
            const entry = await prisma.journalEntry.create({
                data: {
                    userId,
                    entryType: 'WORK_LOG',
                    content: 'Original Content'
                }
            });

            const res = await request(app)
                .put(`/journal/${entry.id}`)
                .set('Cookie', [`auth_token=${token}`])
                .set('HX-Request', 'true')
                .send({
                    content: 'Updated Content'
                });

            expect(res.status).toBe(200);
            expect(res.text).toContain('<div class="journal-card"'); // Expect updated HTML card
            expect(res.text).toContain('Updated Content');

            const updated = await prisma.journalEntry.findUnique({
                where: { id: entry.id }
            });
            expect(updated.content).toBe('Updated Content');
            expect(updated.isEdited).toBe(true);
        });

        it('should preserve mood if not provided in update', async () => {
            const entry = await prisma.journalEntry.create({
                data: {
                    userId,
                    entryType: 'EMOTIONAL_REFLECTION',
                    content: 'Content',
                    mood: 'Happy'
                }
            });

            const res = await request(app)
                .put(`/journal/${entry.id}`)
                .set('Cookie', [`auth_token=${token}`])
                .send({
                    content: 'Updated Content'
                    // mood is missing, should be preserved
                });

            expect(res.status).toBe(200);

            const updated = await prisma.journalEntry.findUnique({
                where: { id: entry.id }
            });
            expect(updated.content).toBe('Updated Content');
            expect(updated.mood).toBe('Happy');
        });

        it('should not update another user entry', async () => {
            // Another user
            const otherUser = await prisma.user.create({
                data: { email: 'other@test.com', name: 'Other' }
            });
            const entry = await prisma.journalEntry.create({
                data: {
                    userId: otherUser.id,
                    entryType: 'WORK_LOG',
                    content: 'Other Content'
                }
            });

            const res = await request(app)
                .put(`/journal/${entry.id}`)
                .set('Cookie', [`auth_token=${token}`])
                .send({
                    content: 'Hacked Content'
                });

            expect(res.status).toBe(404);

            await prisma.journalEntry.delete({ where: { id: entry.id } });
            await prisma.user.delete({ where: { id: otherUser.id } });
        });
    });

    describe('DELETE /journal/:id', () => {
        it('should delete an entry', async () => {
            const entry = await prisma.journalEntry.create({
                data: {
                    userId,
                    entryType: 'WORK_LOG',
                    content: 'To be deleted'
                }
            });

            const res = await request(app)
                .delete(`/journal/${entry.id}`)
                .set('Cookie', [`auth_token=${token}`]);

            expect(res.status).toBe(200);

            const check = await prisma.journalEntry.findUnique({
                where: { id: entry.id }
            });
            expect(check).toBeNull();
        });
    });
});
