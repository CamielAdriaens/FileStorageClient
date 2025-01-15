import 'cypress-file-upload';

describe('File Management E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test to reset the login state
    // Mock login by setting a token in localStorage
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'mock-jwt-token');
    });
    
    // Visit the application page
    cy.visit('http://localhost:3000'); // Change to your actual frontend URL
  });
  
  it('Uploads a file successfully', () => {
    cy.intercept('POST', '/api/Files/upload', {
      statusCode: 200,
    }).as('fileUpload');
  
    // Simulate file upload
    cy.get('input[type="file"]').attachFile('example.pdf'); // Use `cypress-file-upload` plugin
    cy.wait('@fileUpload');
  
    // Verify success alert
    cy.on('window:alert', (text) => {
      expect(text).to.contains('File uploaded successfully.');
    });
  
    // Check if the file appears in the list
    cy.contains('example.pdf').should('exist');
  });

  it('Downloads a file', () => {
    cy.intercept('GET', '/api/Files/download/*', {
      statusCode: 200,
      body: 'Mock file content',
    }).as('fileDownload');
  
    // Click the download button for a file
    cy.contains('example.pdf').parent().contains('Download').click();
    cy.wait('@fileDownload');
  
    // Verify the download interaction
    cy.readFile('cypress/downloads/example.pdf').should('exist');
  });
  
  it('Deletes a file successfully', () => {
    cy.intercept('DELETE', '/api/Files/delete/*', {
      statusCode: 200,
    }).as('fileDelete');
  
    // Click the delete button for a file
    cy.contains('example.pdf').parent().contains('Delete').click();
  
    // Confirm the deletion
    cy.on('window:confirm', () => true);
  
    // Wait for the delete request to complete
    cy.wait('@fileDelete');
  
    // Verify the file no longer exists
    cy.contains('example.pdf').should('not.exist');
  });
  
  it('Shares a file', () => {
    cy.intercept('POST', '/api/Files/share-file', {
      statusCode: 200,
    }).as('fileShare');
  
    // Simulate sharing a file
    cy.contains('example.pdf')
      .parent()
      .within(() => {
        cy.get('input[type="email"]').type('recipient@example.com');
        cy.contains('Share').click();
      });
  
    cy.wait('@fileShare');
  
    // Verify success alert
    cy.on('window:alert', (text) => {
      expect(text).to.contains('File "example.pdf" shared successfully.');
    });
  });
  
  it('Accepts a shared file', () => {
    cy.intercept('POST', '/api/Files/accept-share/*', {
      statusCode: 200,
    }).as('acceptShare');
  
    // Simulate accepting a shared file
    cy.contains('example.pdf shared by sender@example.com')
      .parent()
      .contains('Accept')
      .click();
  
    cy.wait('@acceptShare');
  
    // Verify success alert
    cy.on('window:alert', (text) => {
      expect(text).to.contains('File "example.pdf" share accepted.');
    });
  });
  
  it('Refuses a shared file', () => {
    cy.intercept('DELETE', '/api/Files/refuse-share/*', {
      statusCode: 200,
    }).as('refuseShare');
  
    // Simulate refusing a shared file
    cy.contains('example.pdf shared by sender@example.com')
      .parent()
      .contains('Refuse')
      .click();
  
    cy.wait('@refuseShare');
  
    // Verify success alert
    cy.on('window:alert', (text) => {
      expect(text).to.contains('File "example.pdf" share refused.');
    });
  });
});
