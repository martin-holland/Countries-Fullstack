/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Import Testing Library commands
import '@testing-library/cypress/add-commands';

// Import Real Events
import 'cypress-real-events/support';

// -- Custom commands for Material-UI components --

/**
 * Get a Material-UI Button by its text content
 * @example cy.getMuiButton('Login').click()
 */
Cypress.Commands.add('getMuiButton', (text: string) => {
  return cy.findByRole('button', { name: text });
});

/**
 * Get a Material-UI Card at the specified index
 * @example cy.getMuiCard(0).click()
 */
Cypress.Commands.add('getMuiCard', (index?: number) => {
  const cards = cy.get('.MuiCard-root');
  return typeof index === 'number' ? cards.eq(index) : cards;
});

/**
 * Get a Material-UI Typography component containing the specified text
 * @example cy.getMuiTypography('Countries of the World').should('be.visible')
 */
Cypress.Commands.add('getMuiTypography', (text: string) => {
  return cy.findByText(text);
});

/**
 * Wait for Material-UI loading indicators to disappear
 * @example cy.waitForMuiLoading()
 */
Cypress.Commands.add('waitForMuiLoading', (timeout = 10000) => {
  cy.get('body').then(($body) => {
    if ($body.find('.MuiCircularProgress-root').length > 0) {
      cy.get('.MuiCircularProgress-root').should('not.exist', { timeout });
    }
  });
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select a Material-UI Button by text
       * @example cy.getMuiButton('Submit')
       */
      getMuiButton(text: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to select Material-UI Cards
       * @example cy.getMuiCard() - gets all cards
       * @example cy.getMuiCard(2) - gets the card at index 2
       */
      getMuiCard(index?: number): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to select a Material-UI Typography by text
       * @example cy.getMuiTypography('Hello World')
       */
      getMuiTypography(text: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to wait for Material-UI loading indicators to disappear
       * @example cy.waitForMuiLoading()
       * @example cy.waitForMuiLoading(15000) - with custom timeout
       */
      waitForMuiLoading(timeout?: number): void;
      
      /**
       * Custom command from cypress-real-events to trigger real mouse events
       * @example cy.get('.element').realClick()
       */
      realClick(options?: Partial<MouseEventOptions>): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command from cypress-real-events to trigger real hover events
       * @example cy.get('.element').realHover()
       */
      realHover(options?: Partial<MouseEventOptions>): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Define the MouseEventOptions interface for realClick and realHover
interface MouseEventOptions {
  position: string | { x: number; y: number };
  button: string;
  scrollBehavior: string;
  pointer: string;
  waitForAnimations: boolean;
}