# Todo list. Do not start working on this until I add it to the requirements.

Add login button and change text to see default movies, or log in

Add user to DB + only admins can edit movies
Set up proper authentication
Salt and hash the password
Endpoints need to have authorization
Remove Temporary login in MovieContext: Remember to replace with proper auth context and token handling.

Create a login component. A user does not need to be logged in. If he is not, he can see some default hard coded movies. He can also update and add them to a localStorage. If he logs in it will be saved automatically to his account.

If I decide later to add other users reviews / ratings these should be visible as well (anonimized)
Show overall rating of the movie as well
Show other users reviews, anonimized
Add AI function in app to translate a review to your requested language

Fix tests for updating a movie without rating / review.
Fix height for movie card in the grid. Just use like 150 height and end review with ... if it does not fit.
Implement Playwright MCP
Also implement the react context for the watchlist?
Movie genre should be array
