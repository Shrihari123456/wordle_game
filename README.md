A Wordle-inspired word guessing game built using React + Flask, featuring authentication, admin reports, and a smart hint system to assist players.

Players can register/login, guess words daily, and get hints to help them solve challenges. Admins can view reports of user activity and daily stats.


Tech Stack
Frontend
React.js (CRA) — UI and routing

Tailwind CSS — Styling and layout

Axios — API communication

React Router DOM — Navigation

Toastify — Notifications (optional enhancement)

 Backend

Flask (Python) — RESTful API backend

bcrypt — Secure password hashing

JWT (PyJWT) — Authentication tokens

Flask-CORS — Cross-Origin Resource Sharing

MongoDB / Local DB (configurable) — Data storage

 Features
 Authentication

User registration and login (JWT-based)

Role-based users — admin and player

Secure password encryption using bcrypt

 Game Mechanics

Players can submit word guesses

Validates guesses and provides results

Each player gets a daily challenge

 Hint System (NEW)(using Genai)

Players can request a hint if they get stuck

Hint API returns a contextual clue about the target word

Example:

“The word starts with ‘B’ and relates to weather.”

Admin Panel

Admins can fetch:

Daily reports (/api/admin/report/day/<date>)

User-specific reports (/api/admin/report/user/<username>)

Validation

Strong validation for usernames and passwords

Word guesses checked via regex ([A-Z]{5})


