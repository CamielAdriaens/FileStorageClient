import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000'; // Base URL of your app
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExNzQzMzcxNzcwMTY2MTEwNjQiLCJlbWFpbCI6ImNhbWlsbG90aGVlQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiMTExMTc0MzM3MTc3MDE2NjExMDY0IiwianRpIjoiYmE3MGM3N2EtZmZkZS00MjAyLTk1MTgtNGVmZjY5NzViNWRlIiwiZXhwIjoxNzM3MTMzNzUyLCJpc3MiOiJ5b3VyLWlzc3VlciIsImF1ZCI6InlvdXItYXVkaWVuY2UifQ.VGL8grwndVxMHBLnIUM7jSiPJhBaKzZONOZLPOr1wD8'; // Replace this with a valid token for your backend

test.describe('File Management Features', () => {
  let page;

  // Hook to clean up after all tests
  test.afterAll(async () => {
    await page.close(); // Close the page after all tests are done
  });

  // Test 1: Upload a file and verify it appears in the list
  test('Upload a file and verify it appears in the list', async () => {
    await page.click('text=Upload');

    const filePath = './testdata/friend.jpg';
    await page.setInputFiles('input[type="file"]', filePath);

    await expect(page.locator('text=Upload successful')).toBeVisible();

    const fileName = 'friend.jpg';
    await expect(page.locator(`text=${fileName}`)).toBeVisible();
  });

  // Test 2: Download a file
  test('Download a file successfully', async () => {
    const fileName = 'friend.jpg';

    await expect(page.locator(`text=${fileName}`)).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(`button[aria-label="Download ${fileName}"]`),
    ]);

    const filePath = await download.path();
    expect(filePath).not.toBeNull();
  });

  // Test 3: Delete a file
  test('Delete a file from the list', async () => {
    const fileName = 'friend.jpg';

    await expect(page.locator(`text=${fileName}`)).toBeVisible();

    await page.click(`button[aria-label="Delete ${fileName}"]`);
    await page.click('button:text("Yes, delete")');

    await expect(page.locator(`text=${fileName}`)).not.toBeVisible();
  });

  // Test 4: Share a file via email
  test('Share a file via email', async () => {
    const fileName = 'friend.jpg';

    await expect(page.locator(`text=${fileName}`)).toBeVisible();

    await page.click(`button[aria-label="Share ${fileName}"]`);
    const email = 'test@example.com';
    await page.fill('input[type="email"]', email);
    await page.click('button:text("Share")');

    await expect(page.locator('text=File successfully shared')).toBeVisible();
  });

  // Test 5: Accept a shared file
  test('Accept a shared file', async () => {
    const sharedFileName = 'sharedfile.jpg';

    await expect(page.locator(`text=${sharedFileName}`)).toBeVisible();
    await page.click(`button[aria-label="Accept ${sharedFileName}"]`);

    await expect(page.locator(`text=${sharedFileName}`)).toBeVisible();
  });

  // Test 6: Reject a shared file
  test('Reject a shared file', async () => {
    const sharedFileName = 'sharedfile.jpg';

    await expect(page.locator(`text=${sharedFileName}`)).toBeVisible();
    await page.click(`button[aria-label="Reject ${sharedFileName}"]`);

    await expect(page.locator(`text=${sharedFileName}`)).not.toBeVisible();
  });
});
