/* global describe, it, cy */

describe('Calculations page', () => {
  it('loads and renders calculations table', () => {
    cy.intercept('GET', '**/parent-calculations', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Тестовая калькуляция',
          date_of_creation: '2026-01-02T00:00:00.000Z'
        }
      ]
    }).as('getParentCalculations');

    cy.visit('/calculations', {
      onBeforeLoad(win) {
        // Bypass simple auth-guard in router.beforeEach
        win.localStorage.setItem('isAuthenticated', 'true');
        // AppTopbar reads `user.username` on startup
        win.localStorage.setItem('user', JSON.stringify({ username: 'e2e' }));
      }
    });

    cy.contains('Калькуляции').should('be.visible');
    cy.contains('создать новую калькуляцию-план +').should('be.visible');

    cy.wait('@getParentCalculations');
    cy.contains('Тестовая калькуляция').should('be.visible');
  });
});
