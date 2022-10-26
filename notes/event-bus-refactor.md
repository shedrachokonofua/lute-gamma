# Event Bus Refactor

- Single XREAD call per service
- Replace lookup id with generic correlation id
  - Update all existing events in store
- Event meta-data
