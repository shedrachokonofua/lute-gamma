# Monolith

### Pros:

- Signifcantly quicker build on VPS, biggest pain point
- Signifcantly less resource itensive, though not an issue right now

### Cons:

- Significant undertaking, hard to do while building new features(which is of higher priority)

### Approach

- Move one service at a time into the monolith, starting with file service
- Share event streams OR implement subscribers on both systems that maps all events in either system to the other
