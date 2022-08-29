# API

## Introduction
This document should describe the API, open for discussion, for development.

## Authentication
Like said in the security document there should be a verification of phone number, and then an authentication based on that verification
The authentication token verifies that you are the owner of a phone number, and therefore can change schedule or make a direct call

## General
The API should consume the Accept-Language Header

## Endpoints
Maybe we should considering, prepending a versioning for the API. For example /v1/

### /localization
Endpoint which consumes the Accept-Language Header and returns guessed Language and Country and also a list.
```
{
  language: 'de_AT',
  country: 'AT',
  languages: [
    'en_GB',
    'de_DE',
    ...
  ],
  countries: [
    'AT',
    'DE',
    ...
  ]
}
```

### /parliamentarians
Listing endpoint which should return parliamentarians based on Accept-Language Header and ordered on swing possibility.
Filter based on following GET parameters:
country=AT
language=de_AT
Improvement would be a possibility to set filters.
I usually use the following for list filtering:
Get Parameter for limit and offset e.g. ?limit=5&offset=5
Get Parameter for search e.g. q=name
Get Parameter for which fields should be transfered back ?fields=name,country,swayability

### /schedules
Authentication required
return the schedules for the phone number attached to the authentication.
possibility to get, post, put, delete
country and language need to be provided as parameters.
schedule should be like
```
[
  {
    day: 0,
    start: 1300,
    end: 1400,
    language: 'de_AT',
    country: 'AT'
  },
  {
    day: 1,
    start: 1000,
    end: 1200,
    language: 'de_AT',
    country: 'AT'
  }
]
```

### /call-requests
To initiate a direct call. Just allow POST for creating

Country and language will be provided as parameters.

Authentication required

consumes parliamentarian id

### /calls/{id}/feedback
put feedback for a specific call
