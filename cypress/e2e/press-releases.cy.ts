// cypress/e2e/press-releases.cy.ts
//
// Full CRUD E2E spec for the PressReleases domain module.
// All API calls are intercepted so the spec runs in CI without a live backend.

const ADMIN = { email: 'admin@secom.gov.br', password: 'AdminPassword123!' };

const PR_1 = {
  id: 'pr-001',
  title: 'Comunicado de teste',
  subtitle: '',
  content: 'Conteúdo do comunicado de teste para validação.',
  summary: '',
  category: 'comunicado',
  tags: [],
  status: 'draft',
  createdAt: '2025-01-15T10:00:00.000Z',
};

const PR_2 = {
  id: 'pr-002',
  title: 'Segundo comunicado',
  subtitle: '',
  content: 'Conteúdo do segundo comunicado.',
  summary: '',
  category: 'nota_oficial',
  tags: [],
  status: 'published',
  createdAt: '2025-01-16T10:00:00.000Z',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function stubAuth() {
  cy.intercept('POST', '/api/v1/auth/login', {
    statusCode: 200,
    body: { data: { user: { id: 'u1', name: 'Admin', email: ADMIN.email, role: 'admin' } } },
  }).as('login');

  cy.intercept('GET', '/api/v1/auth/me', {
    statusCode: 200,
    body: { data: { id: 'u1', name: 'Admin', email: ADMIN.email, role: 'admin' } },
  }).as('me');
}

function stubList(items = [PR_1, PR_2]) {
  cy.intercept('GET', '/api/v1/press-releases*', {
    statusCode: 200,
    body: { data: { items, total: items.length, page: 1, limit: 10 } },
  }).as('listPressReleases');
}

function stubHealthCheck() {
  cy.intercept('GET', '/api/v1/health', { statusCode: 200, body: { status: 'ok' } }).as('health');
}

function loginAndVisit() {
  stubAuth();
  stubHealthCheck();
  stubList();
  cy.login(ADMIN.email, ADMIN.password);
  cy.visit('/press-releases');
  cy.wait('@listPressReleases');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PressReleases — List', () => {
  beforeEach(loginAndVisit);

  it('renders the page title and create button', () => {
    cy.contains('h1', 'Comunicados de Imprensa').should('be.visible');
    cy.contains('button', 'Novo comunicado').should('be.visible');
  });

  it('displays items returned by the API', () => {
    cy.contains('Comunicado de teste').should('be.visible');
    cy.contains('Segundo comunicado').should('be.visible');
  });

  it('shows empty state when list is empty', () => {
    stubList([]);
    cy.visit('/press-releases');
    cy.wait('@listPressReleases');
    cy.contains('Nenhum comunicado encontrado').should('be.visible');
  });

  it('filters list via search input', () => {
    stubList([PR_1]);
    cy.get('input[aria-label="Buscar..."]').type('Comunicado');
    cy.wait('@listPressReleases');
    cy.contains('Comunicado de teste').should('be.visible');
    cy.contains('Segundo comunicado').should('not.exist');
  });
});

describe('PressReleases — Create', () => {
  beforeEach(loginAndVisit);

  it('opens the create modal on button click', () => {
    cy.contains('button', 'Novo comunicado').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#modal-title').should('contain', 'Novo comunicado');
  });

  it('shows validation errors when submitting empty form', () => {
    cy.contains('button', 'Novo comunicado').click();
    cy.get('[role="dialog"] button[type="submit"]').click();
    cy.get('.form-error').should('have.length.at.least', 1);
  });

  it('creates a press release and closes the modal on success', () => {
    const created = { ...PR_1, id: 'pr-new', title: 'Novo comunicado criado' };

    cy.intercept('POST', '/api/v1/press-releases', {
      statusCode: 201,
      body: { data: created },
    }).as('createPressRelease');

    stubList([PR_1, PR_2, created]);

    cy.contains('button', 'Novo comunicado').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type('Novo comunicado criado');
      cy.get('textarea').first().type('Conteúdo completo do novo comunicado aqui.');
      cy.get('button[type="submit"]').click();
    });

    cy.wait('@createPressRelease');
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('Novo comunicado criado').should('be.visible');
  });
});

describe('PressReleases — Edit', () => {
  beforeEach(loginAndVisit);

  it('opens the edit modal with pre-filled values', () => {
    cy.contains('tr', 'Comunicado de teste').within(() => {
      cy.contains('button', 'Editar').click();
    });
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"] input[type="text"]').first().should('have.value', 'Comunicado de teste');
  });

  it('saves edits and closes the modal on success', () => {
    cy.intercept('PATCH', '/api/v1/press-releases/pr-001', {
      statusCode: 200,
      body: { data: { ...PR_1, title: 'Comunicado editado' } },
    }).as('updatePressRelease');

    stubList([{ ...PR_1, title: 'Comunicado editado' }, PR_2]);

    cy.contains('tr', 'Comunicado de teste').within(() => {
      cy.contains('button', 'Editar').click();
    });

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type('Comunicado editado');
      cy.get('button[type="submit"]').click();
    });

    cy.wait('@updatePressRelease');
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('Comunicado editado').should('be.visible');
  });
});

describe('PressReleases — Delete', () => {
  beforeEach(loginAndVisit);

  it('opens the confirm dialog on delete click', () => {
    cy.contains('tr', 'Comunicado de teste').within(() => {
      cy.contains('button', 'Excluir').click();
    });
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Tem certeza que deseja excluir?').should('be.visible');
  });

  it('cancels deletion and keeps the item in the list', () => {
    cy.contains('tr', 'Comunicado de teste').within(() => {
      cy.contains('button', 'Excluir').click();
    });
    cy.contains('button', 'Cancelar').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('Comunicado de teste').should('be.visible');
  });

  it('deletes the item and removes it from the list', () => {
    cy.intercept('DELETE', '/api/v1/press-releases/pr-001', {
      statusCode: 200,
      body: {},
    }).as('deletePressRelease');

    stubList([PR_2]);

    cy.contains('tr', 'Comunicado de teste').within(() => {
      cy.contains('button', 'Excluir').click();
    });
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Excluir').click();
    });

    cy.wait('@deletePressRelease');
    cy.contains('Comunicado de teste').should('not.exist');
    cy.contains('Segundo comunicado').should('be.visible');
  });
});
