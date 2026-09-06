-- ============================================
-- GITHUB INTEGRATION TABLES
-- ============================================

-- GitHub Organizations
CREATE TABLE IF NOT EXISTS github_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  login VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  description TEXT,
  html_url VARCHAR(500),
  public_repos INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Repositories
CREATE TABLE IF NOT EXISTS github_repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID REFERENCES github_organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(500) NOT NULL,
  description TEXT,
  private BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  default_branch VARCHAR(255),
  html_url VARCHAR(500),
  clone_url VARCHAR(500),
  language VARCHAR(100),
  stargazers_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  created_at_github TIMESTAMP WITH TIME ZONE,
  updated_at_github TIMESTAMP WITH TIME ZONE,
  pushed_at_github TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Members
CREATE TABLE IF NOT EXISTS github_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  login VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  html_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'MEMBER',
  bio TEXT,
  company VARCHAR(255),
  location VARCHAR(255),
  email VARCHAR(255),
  followers INTEGER DEFAULT 0,
  public_repos INTEGER DEFAULT 0,
  created_at_github TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Issues
CREATE TABLE IF NOT EXISTS github_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  state VARCHAR(50) NOT NULL,
  state_reason VARCHAR(100),
  html_url VARCHAR(500),
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
  author_login VARCHAR(255),
  assignee_login VARCHAR(255),
  labels TEXT[],
  milestone VARCHAR(255),
  comments_count INTEGER DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at_github TIMESTAMP WITH TIME ZONE,
  updated_at_github TIMESTAMP WITH TIME ZONE,
  closed_at_github TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Pull Requests
CREATE TABLE IF NOT EXISTS github_pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  state VARCHAR(50) NOT NULL,
  merged BOOLEAN DEFAULT false,
  merged_at TIMESTAMP WITH TIME ZONE,
  html_url VARCHAR(500),
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
  author_login VARCHAR(255),
  head_branch VARCHAR(255),
  base_branch VARCHAR(255),
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  changed_files INTEGER DEFAULT 0,
  mergeable BOOLEAN,
  review_comments INTEGER DEFAULT 0,
  created_at_github TIMESTAMP WITH TIME ZONE,
  updated_at_github TIMESTAMP WITH TIME ZONE,
  closed_at_github TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Releases
CREATE TABLE IF NOT EXISTS github_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  tag_name VARCHAR(255) NOT NULL,
  name VARCHAR(500),
  body TEXT,
  draft BOOLEAN DEFAULT false,
  prerelease BOOLEAN DEFAULT false,
  html_url VARCHAR(500),
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
  author_login VARCHAR(255),
  published_at_github TIMESTAMP WITH TIME ZONE,
  created_at_github TIMESTAMP WITH TIME ZONE,
  tarball_url VARCHAR(500),
  zipball_url VARCHAR(500),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Workflow Runs
CREATE TABLE IF NOT EXISTS github_workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  run_number INTEGER NOT NULL,
  branch VARCHAR(255),
  status VARCHAR(50),
  conclusion VARCHAR(50),
  event VARCHAR(100),
  html_url VARCHAR(500),
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
  run_attempt INTEGER DEFAULT 1,
  created_at_github TIMESTAMP WITH TIME ZONE,
  updated_at_github TIMESTAMP WITH TIME ZONE,
  started_at_github TIMESTAMP WITH TIME ZONE,
  completed_at_github TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub Events (for webhook idempotency)
CREATE TABLE IF NOT EXISTS github_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  action VARCHAR(100),
  status VARCHAR(50) DEFAULT 'received',
  error TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Project ↔ GitHub Repository (many-to-many)
CREATE TABLE IF NOT EXISTS project_github_repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  role VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, repository_id)
);

-- Task ↔ GitHub Issue (many-to-many)
CREATE TABLE IF NOT EXISTS task_github_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES github_issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, issue_id)
);

-- ============================================
-- INDEXES FOR GITHUB TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_github_repos_org ON github_repositories(organization_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_github_id ON github_repositories(github_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_full_name ON github_repositories(full_name);
CREATE INDEX IF NOT EXISTS idx_github_repos_archived ON github_repositories(archived);
CREATE INDEX IF NOT EXISTS idx_github_repos_pushed ON github_repositories(pushed_at_github DESC);

CREATE INDEX IF NOT EXISTS idx_github_members_login ON github_members(login);

CREATE INDEX IF NOT EXISTS idx_github_issues_repo ON github_issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_issues_state ON github_issues(state);
CREATE INDEX IF NOT EXISTS idx_github_issues_author ON github_issues(author_login);
CREATE INDEX IF NOT EXISTS idx_github_issues_number ON github_issues(number);

CREATE INDEX IF NOT EXISTS idx_github_prs_repo ON github_pull_requests(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_prs_state ON github_pull_requests(state);
CREATE INDEX IF NOT EXISTS idx_github_prs_author ON github_pull_requests(author_login);
CREATE INDEX IF NOT EXISTS idx_github_prs_merged ON github_pull_requests(merged);

CREATE INDEX IF NOT EXISTS idx_github_releases_repo ON github_releases(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_releases_published ON github_releases(published_at_github DESC);

CREATE INDEX IF NOT EXISTS idx_github_workflows_repo ON github_workflow_runs(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_workflows_status ON github_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_github_workflows_conclusion ON github_workflow_runs(conclusion);

CREATE INDEX IF NOT EXISTS idx_github_events_delivery ON github_events(delivery_id);
CREATE INDEX IF NOT EXISTS idx_github_events_type ON github_events(event_type);
CREATE INDEX IF NOT EXISTS idx_github_events_status ON github_events(status);

CREATE INDEX IF NOT EXISTS idx_project_github_repos_project ON project_github_repositories(project_id);
CREATE INDEX IF NOT EXISTS idx_project_github_repos_repo ON project_github_repositories(repository_id);

CREATE INDEX IF NOT EXISTS idx_task_github_issues_task ON task_github_issues(task_id);
CREATE INDEX IF NOT EXISTS idx_task_github_issues_issue ON task_github_issues(issue_id);
