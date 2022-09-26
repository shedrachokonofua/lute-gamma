# North star

- Album recommendation emails
- Auto generated playlists
- Taste profile change analysis over time

# Ideas

## Profile Service

Queuing data for profile generation

- Every 6 hours, cron fetches all saved tracks, dedupes by look-up key, and performs look-up.
- Already saved look-ups are added to the "profile generation queue"
- Started or Found look-ups are added to the "profile candidate hset"
- New event "LookupAlbumSaved"
- New listener for "LookupAlbumSaved", for each item check if member of "profile candidate hset". If so, unset and add to "profile generation queue"

Profile generation

- profile generator picks item off queue
- checks by file id if seen before, if not updates profile document

Profile

- Single document representation of everything needed for analysis calculation
- Endpoint to get profile
- Endpoint to see if file name has been processed

Album analysis

- Endpoint that returns "scores" on how much the album matches the profile

## Recommendation Engine

- Takes params as input: genres, year range
- Searches for all albums in data service matching params that haven't been processed for profile
- Runs album analysis for each
- Recommend top 5 based on "scores"
- Async request: params are hashed in a way that the same input will return cached result when made in the same week. hash key is returned on request and can be used to lookup recommendation. one time notification sent on completion, other services can sub to notification by hash key.

## RYM Seed Cron

- Picks common genres/years from profile, generates list of potential chart ids that haven't been saved, enqueues to crawler.
- Ensures top 10 chart pages for last 50 years are saved atleast once a month.
