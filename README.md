# Lapin AML link shortener project

This project is focused on building a web app for creating and serving short links like Bitly.

The main goal is to achieve a super low latency on a Read path (p50 <1ms at 50k RPS on a cache hit) and create a proper CI/CD pipeline using AWS for both FE and BE apps.

App's layout:

![Screenshot 1](architecture/screenshot1.png)
![Screenshot 2](architecture/screenshot2.png)

## Technical stack

The repository is a monorepo, which works on top of Turborepo (https://turborepo.dev/) and has several apps inside.

### Frontend

A frontend part is a React app, which uses a Tailwind and tools from a Tanstack project.

### Backend

A backend part will be written in TS & Deno. Nginx will work as a reverse proxy and will also call Redis cache, which will ensure a very low latency.

### Data storage

Links will be persistently stored in Postgres and added to Redis cache. Redis cache will be also responsible for counting link opens for analytics. Every minute counters will be updated in Postgres.

## Architecture diagrams

### Read path

```mermaid
sequenceDiagram
  Actor User
  participant Client
  participant Nginx
  participant Redis
  participant NodeJS
  participant PostgresDB

  User->>Client: Opens a short link
  Client->>Nginx: GET /abc
  Nginx->>Redis: GET url:abc

  opt Cache Hit
    Redis-->>Nginx: Target URL
    Nginx-)Redis: INCR opens:abc
    Nginx-->>Client: 302 Redirect to Target URL
  end

  opt Cache Miss
    Redis-->>Nginx: null
    Nginx->>NodeJS: GET /abc
    NodeJS->>PostgresDB: Query for target URL
    PostgresDB-->>NodeJS: Target URL
    NodeJS-)Redis: SET url:abc Target URL
    NodeJS-)Redis: INCR opens:abc
    NodeJS-->>Nginx: Target URL
    Nginx-->>Client: 302 Redirect to Target URL
  end

  opt Cache Miss, target URL not found
    Redis-->>Nginx: null
    Nginx->>NodeJS: GET /abc
    NodeJS->>PostgresDB: Query for target URL
    PostgresDB-->>NodeJS: null
    NodeJS-->>Nginx: 404 Not Found
    Nginx-->>Client: 404 Not Found
  end

  opt Bulk update counters in Postgres every 1 minute
    NodeJS->>Redis: DECRBY opens:abc count
    Redis-->>NodeJS: List of counters
    NodeJS->>PostgresDB: Update counters in Postgres
    PostgresDB-->>NodeJS: OK
  end
```

### Write path

```mermaid
sequenceDiagram
  Actor User
  participant Client
  participant Nginx
  participant Redis
  participant NodeJS
  participant PostgresDB

  User->>Client: Enters target URL
  Client->>Nginx: POST /links { targetUrl }
  Nginx->>NodeJS: POST /links { targetUrl }
  NodeJS->>NodeJS: Validate target URL

  alt Valid target URL
    NodeJS->>NodeJS: Generate short code abc
    NodeJS->>PostgresDB: INSERT link abc -> target URL
    PostgresDB-->>NodeJS: Created link
    NodeJS-)Redis: SET url:abc Target URL
    NodeJS-)Redis: SET opens:abc 0
    NodeJS-->>Nginx: 201 Created /abc
    Nginx-->>Client: 201 Created /abc
    Client-->>User: Shows short link
  else Invalid target URL
    NodeJS-->>Nginx: 400 Bad Request
    Nginx-->>Client: 400 Bad Request
    Client-->>User: Shows validation error
  end
```

### Delete path

```mermaid
sequenceDiagram
  Actor User
  participant Client
  participant Nginx
  participant Redis
  participant NodeJS
  participant PostgresDB

  User->>Client: Deletes short link abc
  Client->>Nginx: DELETE /links/abc
  Nginx->>NodeJS: DELETE /links/abc
  NodeJS->>PostgresDB: DELETE link where code = abc

  alt Link exists
    PostgresDB-->>NodeJS: Deleted link
    NodeJS-)Redis: DEL url:abc
    NodeJS-)Redis: DEL opens:abc
    NodeJS-->>Nginx: 204 No Content
    Nginx-->>Client: 204 No Content
    Client-->>User: Removes short link
  else Link not found
    PostgresDB-->>NodeJS: No matching link
    NodeJS-)Redis: DEL url:abc
    NodeJS-)Redis: DEL opens:abc
    NodeJS-->>Nginx: 404 Not Found
    Nginx-->>Client: 404 Not Found
    Client-->>User: Shows not found state
  end
```

### Testing

Code will be covered with unit & E2E tests. Load testing will be done using k6 (https://k6.io/).

## Deployment

A full CI/CD will be configured and an app will be deployed to AWS every time a commit goes to the master branch.

### Frontend

A client app will be built, deployed and served in S3.

### API, DB & Cache

The rest of the application will be deployed in EC2 in Docker containers.
