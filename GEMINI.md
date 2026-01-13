# Goal 
A simple movies API with frontend and database.

# Rules
Do not add comments at the top of a page stating which page it is.
Do not add comments for imports.
Do not remove my models or constants with new code.

# Movie model
name, year, genre, my rating (float) and a review (my description).

# Stack
NextJS
For ORM use Prisma

# Requirements
Get all movies
Post a movie
Put or patch a movie
Add a search movies API endpoint
Add a search bar in the UI in the list view
Create a migration for the movie model with a new boolean property isOnWatchlist, by default this property should be undefined
Then update the API (POST vs EDIT) accordingly
Then update the UI (POST vs EDIT) accordingly
Add button to only show films on the watchlist
Make the review and rating property optional
Remove edit button in the movie card. Show a light hover animation (expand the card with 0.1) and show a pointer. Clicking on the card should go to the edit page.
Ensure API is not called constantly. First, start with adding debounce on search. 
Second, after adding or updating a movie just update the movie list locally as well. As we are going to a different page we might need to have some statemanagement or a react context.

# Methodology
Use TDD to create the app.

# Notes
First create the API and database part so that I can test it with Postman. If I'm happy continue with the UI.

# Todo list. Do not start working on this until I add it to the requirements.
Add user model with email and name
Move rating, review and isOnWatchlist to a new table (hence also rename myRating to just rating)
Create a login component and add this to main page if user is not logged in. Users should be able to only see movies they added.
Show overall rating of the movie as well
Show other users reviews, anonimized

Fix tests for updating a movie without rating / review.
Fix height for movie card in the grid. Just use like 150 height and end review with ... if it does not fit. 
Implement Playwright MCP
