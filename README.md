# Exercise 27 - Facebook/Google OAuth and JWT REST API

## Run

```powershell
cd E:\SDN\Exercise27
npm install
npm run seed
npm start
```

Server:

```text
https://localhost:3443
```

Default MongoDB:

```text
mongodb://127.0.0.1:27017/newspapers
```

## Environment variables

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Then fill in the credentials you want to test:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/newspapers
JWT_SECRET=exercise27-secret-key
PORT=3443

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://localhost:3443/auth/facebook/callback
FACEBOOK_REQUEST_EMAIL=false

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://localhost:3443/auth/google/callback
```

## Google setup

In Google Cloud Console:

1. Create or choose a project.
2. Open `APIs & Services > Credentials`.
3. Create `OAuth client ID`.
4. Application type: `Web application`.
5. Add authorized redirect URI:

```text
https://localhost:3443/auth/google/callback
```

6. Copy `Client ID` and `Client Secret` into `.env`.

## Login with Google

Open in browser:

```text
https://localhost:3443/auth/google
```

Success response:

```json
{
  "message": "Google login successful",
  "user": {
    "id": "...",
    "username": "...",
    "googleId": "...",
    "provider": "google"
  },
  "token": "..."
}
```

The Google user is saved in MongoDB collection `users`.

## Account linking

Google and Facebook accounts are linked into one MongoDB user when both providers return the same email.

The user document will contain both provider IDs:

```json
{
  "email": "student@example.com",
  "googleId": "...",
  "facebookId": "...",
  "provider": "multiple",
  "providers": ["google", "facebook"]
}
```

Facebook does not always return email. Keep this value disabled if your Facebook app still shows the invalid `email` scope error:

```env
FACEBOOK_REQUEST_EMAIL=false
```

After your Facebook app is allowed to request email, enable it:

```env
FACEBOOK_REQUEST_EMAIL=true
```

## Login with Facebook

Open in browser:

```text
https://localhost:3443/auth/facebook
```

Success response:

```json
{
  "message": "Facebook login successful",
  "user": {
    "id": "...",
    "username": "...",
    "facebookId": "...",
    "provider": "facebook"
  },
  "token": "..."
}
```

The Facebook user is saved in MongoDB collection `users`.

## Test protected API in Postman

In Postman, turn off:

```text
Settings > SSL certificate verification > OFF
```

Use the returned token:

```text
Authorization > Type: Bearer Token
Token: <paste token here>
```

Then test:

```text
GET https://localhost:3443/articles
GET https://localhost:3443/users/me
POST https://localhost:3443/articles
PUT https://localhost:3443/articles/:id
DELETE https://localhost:3443/articles/:id
```
