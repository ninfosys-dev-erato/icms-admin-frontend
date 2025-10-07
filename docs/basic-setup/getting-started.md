Alright, so what i am going to do is to start creating a Next.js admin frontend application with the backend already implemented.
I currently don't have a clear roadmap of all the modules that will be integrated or be implemented but I want a base system where I can add all these features and modules later, aka my system is an iCMS system with the visions i will attach later.
getting to the part of the next.js admin application what i currently need for now is the foundation of the project that outlines the following things

1. i need a login and dashboard thing flow, my requirement is as following
- when a user goes to my site aka via any url and if the user is not logged in i need to redirect the user to the login page, and if the user is already logged in he should directly be greeted to the dashboard.
- for this I already have the API ready in my backend infrastructure which is as following:
so user POST /api/v1/auth/login
logins to the system via this:
{
  "email": "ramesh.kumar@iCMS.gov.np",
  "password": "RameshSecure@2024"
}

the api returns the response as this:
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb83nk0000jse35oz9jzks",
      "email": "ramesh.kumar@iCMS.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:23.936Z",
      "updatedAt": "2025-07-27T06:40:23.936Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjgzbmswMDAwanNlMzVvejlqemtzIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIwMzgzMDkwYzk2YzI4OGRlMGQwMDhmNWNlMmUwOGNiMyIsImV4cCI6MTc1MzYwMjAyNH0.BuYH6-mR64k2FKsixu4kdICrGfsl5xEKwDsRJC_6ec0",
    "refreshToken": "161d3b44a43a45732619c65f7edfb2b606bd8302088e3f95e8d5d18c0b00f409165267c059e9adffd4693db4a8ea2b6fd53e535cb714540a3152c07cee278422",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:24.164Z",
    "version": "1.0.0"
  }
}


the user can verify that he is actually logged in via this :
GET /api/v1/auth/me
which returns
{
  "success": true,
  "data": {
    "id": "cmdlb83nk0000jse35oz9jzks",
    "email": "ramesh.kumar@iCMS.gov.np",
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "role": "ADMIN",
    "isActive": true,
    "isEmailVerified": false
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:24.171Z",
    "version": "1.0.0"
  }
}

The authorization token is passed via the header, for unauthorized access,
the backend returns the following:
API Call: GET /api/v1/auth/me
Headers:

Authorization: Bearer invalid-token-12345


Response: 🔴 401 (6ms)

{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.398Z",
    "version": "1.0.0"
  }
}


What happened: Token validation prevents unauthorized access with forged credentials

also i have rate limiting error as this:
What John Smith (Tourist) expects: After several attempts, the system should start blocking requests
API Call: POST /api/v1/auth/login
Request Body:

{
  "email": "nonexistent@example.com",
  "password": "wrongpassword5"
}


Response: 🔴 401 (91ms)

{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Too many failed attempts. Please try again later."
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.752Z",
    "version": "1.0.0"
  }
}

now for a normal ping pong type of request or such i have that /auth/me thing
alright this is my backend, i have multiple modules like auth, hr, header, important-links, faq and many more

which i will integrate in the admin panel eventually, but beginning forward, i want the following requirements in my next.js application

- the Next.js version must be latest (15.x.x) is already published don't use Next.js 14.
- Internalization is super super requirement, i want super fast translations immediately super responsive translations between nepali and english content, this is a government website and this is super super noted and such.
- I want to use IBM's Carbon UI for the design and styling, all the things and such completely the design and philoshopy should be based on carbon UI's structure.
- Since this is a super powerful enterprise application I need a robust state management system such as Zustand.
- As well as I need a very very robust and super reliable API layer that is integrated with the zustand may be tanstack query or something, my requirement is that i want everything to be separate and such aka like layer basis or somehting like the API layer, the service layer and the zustand layer and everything, i want it to be super domain driven designed and super super nice and such please the overall application structure needs to be super scalable.
- One primary issue with internazliation is i don't want to drill down heavy jsons via root and use that at client components, what i want is a system or such thing where the individual client components can get their desired translation keys and such on the fly.
- as well as since these translations will grow over time and increase in size, i want them to be well thought out for scale from the start, aka divided by domains such as say auth/login domain auth/register domain, content-management/create domain content-management/update domain and such as well as some of the commmon things and such that might be available.
- the next requirement that I have is it needs to follow the standard dashboard patterns which includes breadcrumbs, toast, side nav, top nav, and such, i want it to be super super nice and such please.
- so overall, the state management should be super robust, the api layer separate, the business logic separate, 
- all files distributed and such so that no any single file is greater than 1000 lines, and such.
- and test driven, all the components, all the behaviours and everything and the UI or the things, everything should be testable and such reliably and such please. aka help me here and such please.

The system name is iCMS, the design should follow Carbon UI, the thing should be internazliationzed.
and such please, so the code should be super scalable and super super nice please.
help me with this.
