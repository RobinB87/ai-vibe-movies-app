# Goal 
A simple movies API with frontend and database.

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


# Methodology
Use TDD to create the app.

# Notes
First create the API and database part so that I can test it with Postman. If I'm happy continue with the UI.

# Todo list. Do not start working on this until I add it to the requirements.
Updating movie rating behaves weird because of the comma. It should just be text field which accepts both dot and comma
Ensure API is not called constantly. Start with adding debounce on search. I might add other requirements later.
Add user model with email and name
Move rating, review and isOnWatchlist to a new table (hence also rename myRating to just rating)
Create a login page. Users can only see the movies they added.
Show overall rating of the movie as well
Show other users reviews, anonimized