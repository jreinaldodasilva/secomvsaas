describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('shows login form', () => {
    cy.get('form.login-form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('shows error on invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('.form-error').should('be.visible');
  });

  it('redirects to dashboard on valid login', () => {
    cy.get('input[type="email"]').type('admin@vsaas.test');
    cy.get('input[type="password"]').type('TestPassword123!@#');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('navigates to forgot-password page', () => {
    cy.get('a[href="/forgot-password"]').click();
    cy.url().should('include', '/forgot-password');
    cy.get('input[type="email"]').should('exist');
  });

  it('navigates to register page', () => {
    cy.get('a[href="/register"]').click();
    cy.url().should('include', '/register');
    cy.get('#name').should('exist');
    cy.get('#companyName').should('exist');
  });

  it('shows forgot-password success on submit', () => {
    cy.visit('/forgot-password');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/login"]').should('be.visible');
  });
});

describe('Protected Routes', () => {
  it('redirects unauthenticated user to login', () => {
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('shows 403 page for unauthorized route', () => {
    cy.visit('/unauthorized');
    cy.contains('403').should('be.visible');
  });

  it('shows 404 page for unknown route', () => {
    cy.visit('/nonexistent-page');
    cy.contains('404').should('be.visible');
  });
});
