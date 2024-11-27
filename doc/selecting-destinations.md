<!--
SPDX-FileCopyrightText: © 2024 Tim Weber

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Selecting Destinations

This document talks about the design of DearMEP’s [Destination](glossary.md#destination) selection and [Swayability](glossary.md#swayability) calculation.

**Please note:**
This is a **draft** (i.e. not fully written) of a **design document** (i.e. not fully implemented).
Do not expect DearMEP to behave like this yet; this document is merely a basis for discussion.
In this document, we use the terms Member of European Parliament (MEP), politician and Destination interchangeably.

# Design goals

* We want to focus on contacting those Destinations that are
  * not yet completely on our side anyway and that are
  * not already obviously lost to our cause, e.g. because they are outspoken opponents of the campaign’s goal.
* In other words, we want to contact those who are probably still unsure, or who can likely be convinced by arguments from their voters. We say that these Destinations have a high _Swayability_.
* We want to use our Users’ time as efficient as the campaign’s money wisely.
* We aim to connect Users to Destinations from the country they’ll be voting in, because this gives the Destination an incentive to listen to what the User has to say, and also because the User is most likely somewhat invested in that country.
* There is a limit to the amount of phone calls a Destination should receive in order to be respectful of the time of their office. We should not overtax people, even if they have a high Swayability.
* If possible, our Users should not feel disheartened by their experience, but motivated to keep going.
* The same User should not be contacting the same Destination in a short period of time.


# Basic operation

DearMEP uses several factors to determine which Destinations to prefer.
These factors can be divided into _static_ and _dynamic_ ones.

## Static factors

Static factors are usually determined at the start of the campaign and don’t change often, although they can be updated during the course of the campaign.
They are usually calculated by a human, in a process that is somewhat manual, even though there might be automation and tools to assist with it.
For example, an initial score for each Member of Parliament could be determined by looking at the parliamentary group they belong to, their country, as well as past votes or public statements by that person.
For example, a Green politician could be assumed to generally vote for climate issues and might already be convinced to support a certain issue.
For certain politicians, the campaign managers might even want to manually adjust the score.

This process can be handled well by a spreadsheet containing each of the MPs, probably augmented by voting results and manual scores.
DearMEP’s [converters](data-conversion.md), combined with tools like [csvkit](https://csvkit.readthedocs.io/), can help in generating raw data for the spreadsheet, and then read the results (e.g. after some custom formulas designed by the campaign have been applied) back into the system.
Past voting behavior is generally available in machine readable format on the [website of the European Parliament](https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes)

The most important static factor is called **Base Endorsement**.
This is a value between 0 and 1, where 0 means “is firmly committed to opposing the campaign” and 1 means “will support the campaign with absolute certainty”.
The closer this value moves to 0.5, the more undecided the Destination is.

The campaign can configure which Endorsement value is the most interesting to target.
For example, a campaign might target the 0.5ers, in an effort to sway the undecided ones.
During the course of the campaign, it might make more sense to instead start focusing on 0.65 Endorsement Destinations, in order to ensure that they stay on track, or focus on 0.35 to try and get more supporters.

## Dynamic factors

These are calculated automatically by DearMEP in response to certain actions, events, or User feedback.

**User feedback** is collected after each phone call.
Users are requested to state whether they think that the person will endorse the campaign’s cause.
This results in a **Feedback Endorsement** entry being created in the database.
It consists not only of a 0-to-1 number depending on what the User stated, but also which user gave that feedback and when, and how often they gave feedback already.
All that information can then be used to skew the Base Endorsement.

For example, the last 10 entries could be used to create a weighted sliding average Feedback Endorsement score:
Feedback by more experienced users could influence the average more than “newbie” (or “untrusted”) feedback.
Also, the number of entries could determine how much to influence the Base Endorsement, meaning that a single User feedback would not skew it by a lot, but ten identical ones might.

**Recency**, i.e. how short ago this Destination has last been called, can influence the priority of a Destination, too.
While there will be a separate, hard “no-contact timeout” to ensure that a person who has just been called will not be called again (e.g. because the conversation might still be ongoing), DearMEP should also slightly prefer Destinations who haven’t been called for a long(er) time.
This ensures that everyone will get called at some point.

Similar to that, **Frequency** measures how often a person has been called (overall, or over the last _n_ days), and reduces that person’s priority accordingly.

## Randomness

Combined together, the static and dynamic factors result in a **Priority Score**.
The higher the Priority Score, the more likely it is for DearMEP to suggest to contact this Destination.

However, it most likely makes no sense to always contact the Destination(s) with the highest Priority.
They might get overwhelmed, while other persons with a still high, but slightly lower Priority might not be contacted at all.

Instead, the Priority should only be a large factor in the selection process, but a certain randomness should be applied, too.
Also, some Destinations should be outright ignored:
Those blocked by no-contact timeouts (because they have been called very recently), those that are above or below a certain Endorsement threshold (“is already guaranteed to (not) support us”), etc.
Another factor might also be how often a Destination was unsuccessfully called (some MEPs simply never pick up their phone).

There are several algorithms that could be used:

* Select the _n_ available (i.e. not blocked by no-contact timeouts etc.) Destinations with the highest Score, pick one of them at random. Easy to implement. Will never contact Destinations with a really low Score.
* Select a Destination from _all_ of the available ones, using the Score as a weight that increases their chance to be picked. Slightly harder to implement, but gives every available Destination a chance.
* Manipulate the Score by a random value (increasing or decreasing it), then select the top (or one of the _n_ top) scorer(s). Again, easy to implement, but hard to fine-tune.


# User motivation

As a secondary priority, DearMEP should also provide an enjoyable, positive experience to its Users.
This includes the following design goals:

* If the User is new (e.g. on their first to third call), avoid connecting them to Destinations with an Endorsement of ≤ 0.5. This might give them an easier start, and a feeling of success.
* If a User’s recent _n_ (e.g. 2 or 3) calls all had “I don’t think I’ve convinced that person” feedback, connect them to a Destination with an Endorsement > 0.5, in an effort to boost morale (by succeeding to convince a person that already leaned towards the campaign’s goal) and also to make it easier for them.
* If a User’s recent _n_ (e.g. 3 to 5) calls all had positive feedback, try to connect them to a Destination with a lower Endorsement value. This is mainly done based on the assumption that the User is simply very convincing, but also in order to have more “easy” destinations available for Users on a losing streak (see previous bullet point).
* Depending on the campaign’s strategy, it might be useful to connect Users to “easier” Destinations every once in a while, just to keep them motivated.
