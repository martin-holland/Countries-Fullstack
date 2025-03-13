describe('Countries Application', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Wait for initial loading to complete using our custom command
    cy.waitForMuiLoading();
  });

  it('displays the navigation bar correctly', () => {
    // Check if the AppBar is rendered using Testing Library queries
    cy.findByRole('banner').should('exist');
    
    // Check if the app title is displayed
    cy.findByText('My App').should('be.visible');
    
    // Check if navigation links are displayed with exact text
    // Use more reliable selectors based on the actual DOM structure
    cy.get('.MuiButton-root').contains('Countries').should('be.visible');
    cy.get('.MuiButton-root').contains('Home').should('be.visible');
    cy.get('.MuiButton-root').contains('Public Data').should('be.visible');
    cy.get('.MuiButton-root').contains('Protected Data').should('be.visible');
    cy.get('.MuiButton-root').contains('Login').should('be.visible');
  });

  it('displays the countries list with correct heading', () => {
    // Check if the countries heading is displayed with exact text
    cy.getMuiTypography('Countries of the World').should('be.visible');
    
    // Check if country cards are loaded
    cy.getMuiCard().should('exist');
  });

  it('shows country details when a country card is clicked', () => {
    // Wait for countries to load
    cy.getMuiCard().should('exist');
    
    // Get the first country card and extract its name
    cy.getMuiCard(0).within(() => {
      // Get the country name from the first Typography element
      cy.get('.MuiTypography-root').first().invoke('text').as('countryName');
    });
    
    // Click the first country card
    cy.getMuiCard(0).click();
    
    // Verify we're on the country detail page
    cy.url().should('include', '/countries/');
    
    // Use the stored country name to verify it appears in the detail view
    cy.get('@countryName').then((countryName) => {
      cy.log(`Looking for country name: ${countryName}`);
      cy.findByText(countryName.toString()).should('be.visible');
    });
    
    // Verify the back button exists
    cy.findByText('Back to Countries').should('be.visible');
  });

  it('navigates back to countries list from detail page', () => {
    // Wait for countries to load
    cy.getMuiCard().should('exist');
    
    // Click the first country card
    cy.getMuiCard(0).click();
    
    // Verify we're on the country detail page
    cy.url().should('include', '/countries/');
    
    // Click the back button
    cy.findByText('Back to Countries').click();
    
    // Verify we're back on the countries list page
    cy.url().should('include', '/countries');
    cy.getMuiTypography('Countries of the World').should('be.visible');
  });
}); 