import { test, expect } from '@playwright/test';

test('GESBOX - Carga de módulo principal', async ({ page }) => {
  // Visita tu aplicación corriendo en local
  await page.goto('http://localhost:3000/');

  // Verifica que la página cargue correctamente
  await expect(page).toHaveTitle(/GESBOX/);
});

