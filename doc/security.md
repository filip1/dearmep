# Security considerations

## Terminology

Please see the [glossary](glossary.md) for a list of domain-specific terms that may appear below (usually recognizable by starting with a capital letter).

## Identifying Users

To increase Conversion and reduce friction, the system does not use traditional email/password logins.
Instead, significant parts can be used anonymously.
Placing calls naturally requires us to have the User’s phone number, which needs to be verified before being used.
For this, we’re using SMS texts with a six-digit one-time code.

However, due to the inherent statelessness of HTTP APIs, we’d have to send a lot of verification SMS messages if we didn’t somehow cache the user’s identity.
We’re using session cookies for this:
Cookies that will be removed once the User closes their browser window.
These usually don’t require consent (neither from a legal point of view nor via the browser), as they cannot be used to track users over a longer period of time.

To prevent having to keep a list of session identifiers on the server side, the cookie is a [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token) signed by the application.
We’ll call this the Session Token.
Its inactivity timeout can be configured.

Additionally, to ensure that a User still owns the phone number they verified, even if they try to artificially keep their session alive for days or even months, there is a second timeout that does not refresh on API requests.
After it is reached, the number needs to be verified again.

## Phone number verification via SMS

As discussed in the previous section, before initiating a call with the User, we need to ensure that they own the phone number they’ve entered into our system.
In order to do that, we’re using the standard way of sending a SMS message to the provided number looking something like this:

> 123456 is your {campaign_name} registration code. If you think you have received this message in error, simply ignore it.

The user can then convert this Verification Code to a Session Token for the next `telephony.sms_verification.timeout` seconds (e.g. 15 minutes) by calling the respective API endpoint.
While the JWT sessions can be verified in a stateless way, the SMS codes cannot, and we need to keep a list of pending phone numbers and their associated verification codes.

### Preventing abuse

An attacker might try to use the SMS verification to spam a victim or incur excessive expenses to us.
Therefore, the following rules apply:

* Verification Codes cannot be re-requested before they time out.
* A phone number that has been sent `telephony.sms_verification.max_unused` Verification Codes without any of them being converted to Session Tokens will be added to a block list in the system and needs to be manually unblocked before being able to be used again.

## Features requiring authentication

There are several occasions in which authentication of the phone number is necessary.
We’ll talk about them in the following sections.

### Establishing an Instant Call

In this scenario, if we didn’t do an initial SMS verification, an attacker could enter a phone number into the application in the middle of the night, causing the victim to be called, possibly in a foreign language.
Also, placing a call is more expensive than sending an SMS, which makes malicious calls more problematic than malicious SMS.

### Configuring the Schedule

When creating the first Schedule for a User, SMS verification serves the same purpose as when establishing an Instant Call:
Making sure only persons who opted in will actually be called.
If the User already has a Schedule, we don’t want an attacker to be able to modify it without the user’s approval.

## Rate Limiting

Most web applications can get away with not thinking too hard about rate limiting:
If your app is suffering a [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack), it might simply go down.
However, if your app starts sending out hundreds of SMS text messages per second because your political enemy unexpectedly has some computer-savvy supporters, things can get quite costly quite quickly.

Therefore, this application contains several rate limits with conservative defaults.

### Outbound SMS messages

We’ve already discussed that only a certain number of text messages can be sent to a single phone number for verification.
However, an attacker might also invent thousands of phone numbers and request Verification Codes for them.
To prevent that, we limit

* the number of requests per IP address (`telephony.sms_verification.per_ip_limit`) and
* the number of messages being sent in total (`telephony.sms_verification.send_limit`)
