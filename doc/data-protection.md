# Data Protection & Privacy

This document outlines the data DearMEP collects, or is planning to collect, mainly from the perspective of a User of the system (see the [glossary](glossary.md)).
Please note that not all of the functionality outlined in this text may have been implemented yet; it is mainly a design document.


## IP Address

DearMEP is using the User’s IP address for two purposes:
geolocation and abuse prevention.
The IP address is kept in RAM only and not persisted.
(**TODO:** Should we, or do we even need to, keep the IP addresses used when logging in, intiating a call, or scheduling calls, for abuse investigation purposes?)

Note that we are only talking about the DearMEP application itself.
When deployed, a reverse proxy or other services running on the server machine(s) might persist IP addresses as well, which is out of scope of this document.
(**TODO:** We should probably not log full IP addresses on HTTP access though, as is currently the case.)

### Geolocation

The IP address is looked up in DearMEP’s geolocation database (except if explicitly disabled) to determine the country from which the User is accessing the application.
This is being used to select a Destination to call.

The lookup occurs locally on the server, not via a third-party service.
The IP address is not persisted.
However, a counter that tracks successful geolocation lookups is increased, receiving the country (not the IP address) as a parameter.

Instances which do not span multiple countries could disable the geolocation feature.

### Abuse Prevention

Many of DearMEP’s API endpoints use rate limiting to prevent abuse.
As most of the endpoints do not require any kind of user authentication, this rate limiting cannot target the specific user, and instead has to take other identifying information into consideration.

Currently, rate limits are applied per IP address.
Rate limit tracking is taking place in RAM only and will not be persisted.
(Restarting the application will reset the rate limit tracking.)


## Phone Number

When using DearMEP’s calling features, we naturally have to handle the User’s phone number in multiple places.

### Authentication Requests

Before a User is allowed to initiate or schedule a call, we need to ensure that they actually have access to the phone number they are using.
To do that, we send a Verification Code to the number entered by the User, and require them to tell us what the code is.

For this to work, we need to keep track of the phone numbers and associated codes.
This information is persisted to the database in order to survive application restarts.

However, for authentication, we technically only need a value derived from the phone number, not the number itself.
Therefore, we only keep a peppered hash of the number, in order to minimize the exposure of personal information in case of a breach.
It should be noted, though, that brute-forcing these hashes (should the database _and_ the pepper be obtained by an attacker) is significantly easier than passwords, due to them only consisting of digits.

Depending on the exact feature that is using these password hashes, the hashing must also be able to be performed quickly, in order to minimize latency.
For example, in IVR webhooks, even a one-second delay might degrade the user experience significantly.
Therefore, we are not specifying the exact algorithms to be used in this document, and there may even be different algorithms in use in different parts of the application.

For monitoring and debugging purposes, the hashed value will also store the country code of the number, as well as the first _n_ digits of the phone number, unhashed.
This allows us, for example, to detect provider outages to a certain degree.
The amount of data stored unhashed is configurable:
Administrators can choose to store only the country code, the country code and 1 to 5 first digits (configurable), or nothing at all.

As the Verification Codes have an expiration date, expired database entries will be purged automatically and regularly at least once per hour.

To prevent abuse, we also track and persist how often a Verification Code has been requested for each phone number.
If the number of attempts crosses a configurable threshold, the number will no longer be allowed to issue any more verification requests, to prevent an attacker spamming a person with verification messages.
We are using the same peppered hashes as above for this.
(**TODO:** Hashing these numbers here means that we will not be able to retrieve a list of “which numbers have been abused” from the system. Would we need that? Even when using the hashes, we would still be able to tell, given a specific number, whether this number has been abused. My recommendation is to _not_ hash these records.)

The verification abuse database entry for a given number will be removed once that number has been verified (by telling us the correct code).
By design, there is no automatic time-based purging of these entries.

Sending the SMS messages involves a third party, which will most likely keep a record of the recipient’s number.

### Authentication Credentials

After a User has been verified to own a certain phone number, the system will issue a JSON Web Token (JWT) to be stored in a cookie in that User’s browser.
The token is signed by the server, which allows the server to detect whether a cookie has been forged.

This way, the server does not need to keep track of which phone numbers have been verified, which significantly lowers the impact in case of a breach.

For added security, the phone number in the cookie is stored encrypted, with only the server being able to decrypt it again.
This ensures that even if an attacker is able to retrieve the User’s cookie database, they will not gain access to their phone number.

The authentication cookies time out after a configurable time, or when the User closes their browser.

### Instant Phone Calls

If the User requests a phone call to be initiated right now, this request will be authenticated by their JWT.
DearMEP will then initiate the call using a third-party service, which will most likely keep a record of the transaction, including the phone numbers involved.

During the call, interactions with the IVR system (e.g. selecting an item from a menu, or confirming something, by pushing a number on your phone) will cause the third-party service to communicate with DearMEP, e.g. via webhooks, to notify it about state changes and request instructions.
This communication will include either a call session ID, the involved phone numbers, or both.

While keeping track of the call state in RAM only would be nice from a data protection standpoint, restarting DearMEP while calls are ongoing could be disruptive.
Therefore, we need to persist call state to the database, as long as the call is ongoing.
The User’s phone number will nevertheless be hashed as described above.

The call state database record will be deleted once a call terminates, and (should the application somehow not be notified of the termination) after a configurable timeout.

Additionally to the call state, DearMEP also keeps a record called a “call summary”.
This will include the User’s phone number (hashed, as above), the called Destination, and time stamps.
The call summary can be used for statistics, cost controlling, and debugging.
DearMEP can be configured to not store the User’s phone number in call summaries.

### Scheduled Phone Calls

A user requesting DearMEP to schedule a phone call for later is the only time the system has to store an un-hashed version of the phone number.
Instead, the database records for Scheduled Calls will contain the phone number encrypted with a configurable secret only known to the application, possibly the same secret that’s used as a pepper when hashing.

These scheduling database records will be deleted as soon as they are no longer required, i.e. as soon as the User is no longer interested in Scheduled Calls.

Call state and call summary records, as described above, will be created as soon as the scheduled time occurs and the system initiates the calls.

### Number Tracking / De-Hashing

If a certain number is suspected to be abusing the system, DearMEP can be instructed to “de-hash” that number, allowing administrators to view the complete number, without any hashing.

To use this feature, an administrator provides a hashed representation of a phone number (as it is stored at several points in the database, as described above) to the DearMEP command-line interface.
DearMEP will then add this hash to a list of numbers to be de-hashed.
The next time DearMEP is provided with a number in clear text (e.g. from an API request or webhook) that results in the provided hash, it will store the clear-text version in a separate de-hashing database table.
The administrator can then eventually read the clear-text version and delete it from the database again.


## Call Feedback

After a call, Users are asked to provide feedback about the experience, and whether they think they were successful in convincing the other person.
This feedback is stored in the database, together with some statistical information like the User’s country and language as well as the unhashed country code and prefix as described above, but not the whole phone number.

A unique feedback token will be issued per call to allow users to only leave feedback if they actually made a call, and only once per call.


## Browser Fingerprints & Request Headers

DearMEP does not use any server-side fingerprinting of browser behavior, identification strings, or similar information, with the exception of the `Accept-Language` header to automatically choose a recommended language for User interaction.

The `Accept-Language` header is not persisted.
As with the IP-based geolocation, however, there is a metric counting the number of localization detection requests, and which language was recommended how often.


## Logging & Metrics

As described above, DearMEP will not log full IP addresses or phone numbers during normal operation, except possibly when debug-level logging is enabled, which is not the default.
Exception stack traces and crash dumps may contain unfiltered data, including personal information, but these should not occur during normal operation.

Logs and persisted data created by other software or hardware is out of scope of this document.

DearMEP collects and provides [Prometheus](https://prometheus.io/) metrics.
These are mainly numerical values, e.g. “number of currently active calls” or “number of calls initiated by Users with a French country code”, and thus do not contain any personal information.
