<!--
SPDX-FileCopyrightText: © 2023 Tim Weber

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Interactive Voice Response (IVR)

DearMEP's phone feature includes an [IVR](https://en.wikipedia.org/wiki/Interactive_voice_response) menu to guide Users through the process.
This document describes the structure of the menu and the ideas behind it.

Note that the authoritative list of all messages that are used in the IVR is [`messages.csv`](ivr/messages.csv) (or, of course, [the code](../server/dearmep/phone)).
See [Additional Files](#additional-files) for more information.

Please also have a look at the [glossary](glossary.md) for some special terms we might be using in this document.

Some general things first:

* The tables below list the message IDs and an example of what the audio file for this message could contain. You are of course free to replace message texts.
* `group_X` refers to one of the group audio files, see [Group Names](#group-names).
* `weekday_N` refers to one of the weekday audio files from `weekday_1` (Monday) to `weekday_7` (Sunday).
* The names of the Destinations are taken from their associated name audio that was imported into the database, see the [Data Conversion](data-conversion.md) document.
* Users can push a button to select something at any time while in the menu, they don't have to wait until all messages have been played.
* Users can of course hang up at any time and DearMEP will stop further processing of the call.


## Call Flow

This section lists all the menus in the IVR and all the options the User can take.


### Instant Call

If a User clicks "call now" on the website to talk to a Destination (e.g., an MEP), we refer to it as a _Instant Call_ (as opposed to a [Scheduled Call](#scheduled-call) described below).
DearMEP will call the User's phone, and when they pick up, they are in the main menu.

They will receive a greeting, mentioning who we are.
We ask for confirmation whether they would like to now be connected to the person they chose.
Alternatively to confirming that by pressing <kbd>1</kbd>, they are offered the option to listen to the talking points first by pressing <kbd>5</kbd>.

Example:

| ID                      | Message                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| `campaign_greeting`     | Hello, this is an automated call from the Campaign Against Chat Control. |
| `main_choice_instant_1` | Do you want us to connect you with                                       |
|                         | [name of Destination]                                                    |
| `main_choice_instant_2` | Then press 1.                                                            |
| `main_choice_arguments` | If you want to hear a list of arguments first to prepare, press 5.       |

Options:

* <kbd>1</kbd>: [Attempt to Connect](#attempt-to-connect)
* <kbd>5</kbd>: [Play Talking Points](#play-talking-points)


### Scheduled Call

Users can configure DearMEP to call them at a certain time on one or more days of the week, so that they don't actively have to think about returning to the system to make another call.
We call these calls _Scheduled Calls_, and just like with [Instant Calls](#instant-call), DearMEP will call the User's phone.
When they pick up, they are in the following menu, which is similar to the one for Instant Calls, but has a few more options.

First of all, the greeting is expanded by telling the User that this is a scheduled call configured by them.

Also, since the User didn't interactively select a Destination prior to the call, DearMEP made a selection automatically.
To give the User an idea of who they'll be talking to, we include their associated parliamentary group in our text.

In addition to the option of hearing the talking points, the User can also conveniently postpone this call for a few minutes (once), or unsubscribe from further automated calls.

Example:

| ID                        | Message                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `campaign_greeting`       | Hello, this is an automated call from the Campaign Against Chat Control. |
| `main_scheduled_intro`    | You asked us to call you for this appointment.                           |
| `main_choice_scheduled_1` | We would like to connect you now with                                    |
|                           | [name of Destination]                                                    |
| `main_choice_scheduled_2` | from the group                                                           |
| `group_X`                 | [name of parliamentary group]                                            |
| `main_choice_scheduled_3` | If you agree, press 1.                                                   |
| `main_choice_postpone`    | If you don't have time right now, press 2.                               |
| `main_choice_unsubscribe` | If you do not want us to call you at this time in the future, press 3.   |
| `main_choice_arguments`   | If you want to hear a list of arguments first to prepare, press 5.       |

Options:

* <kbd>1</kbd>: [Attempt to Connect](#attempt-to-connect)
* <kbd>2</kbd>: [Postpone](#postpone)
* <kbd>3</kbd>: [Unsubscribe](#unsubscribe)
* <kbd>5</kbd>: [Play Talking Points](#play-talking-points)


### Attempt to Connect

If the User selected <kbd>1</kbd> from either the [Instant](#instant-call) or [Scheduled](#scheduled-call) main menu, DearMEP will check whether it makes sense to connect to the Destination at the moment.
Because if we know that some other User is currently in a call with that Destination, we don't need to try to connect a second call to them.

In that case, DearMEP will try to automatically select an alternative.
If it finds one, it will [suggest](#suggest-an-alternative) it.
If it doesn't, it will ask the User to [try again later](#try-again-later).

But since DearMEP has already done this check before initially suggesting the Destination to the User in the first place, it usually will be available.
The only exceptions to this might be:

* Somebody else has started a call with that Destination in the meantime, e.g. because the User we're talking to spent some time in the menu.
* The User has manually searched for the Destination on the website instead of letting DearMEP suggest someone.

If the Destination is available, see [Connecting](#connecting) for what happens next.


### Connecting

This is pretty simple.
We announce to the User that we'll connect them now.

| ID                   | Message                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `connect_connecting` | All clear! We'll connect you. One moment, please. Of course, your conversation will not be recorded. |

After that message, without any further confirmation, we disconnect the User from the IVR system and forward the call to the Destination.
The User will hear the ring tone (or, if they're unlucky, the busy tone), just as if they had called the Destination themselves.


### Suggest an Alternative

If the Destination the User suggested was not available when we [attempted to connect](#attempt-to-connect) and we found an available alternative, we will suggest that and ask the User to confirm.

Example:

| ID                      | Message                                              |
| ----------------------- | ---------------------------------------------------- |
| `connect_unavailable`   | This person is apparently already in a conversation. |
| `connect_alternative_1` | May we instead connect you to                        |
|                         | [name of Destination]                                |
| `connect_alternative_2` | from the group                                       |
| `group_X`               | [name of parliamentary group]                        |
| `connect_alternative_3` | Then press 1. Otherwise press 2.                     |

Options:

* <kbd>1</kbd>: We will instantly try to connect the call as described under [Connecting](#connecting). No additional checks as in [Attempt to Connect](#attempt-to-connect) will be made, to prevent an endless loop of alternatives.
* <kbd>2</kbd>: See [Alternative Refused](#alternative-refused).


### Alternative Refused

If we [suggested an alternative Destination](#suggest-an-alternative) to the User, but they refused to accept it, we will politely hang up.

If this has been a [Instant Call](#instant-call):

| ID                        | Message                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `connect_try_again_later` | Please try again later, or select someone else on our website. |
| `generic_goodbye`         | See you soon!                                                  |

If this has been a [Scheduled Call](#scheduled-call), we inform the user that we are going to call again at the next scheduled point in time:

| ID                   | Message                                         |
| -------------------- | ----------------------------------------------- |
| `connect_will_retry` | We will call you again at the next agreed date. |
| `generic_goodbye`    | See you soon!                                   |

In any case, the call ends here.


### Try Again Later

If we did not find an alternative to a busy Destination while [attempting to connect](#attempt-to-connect), we ask the User to try again later:

| ID                        | Message                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `connect_unavailable`     | This person is apparently already in conversation.             |
| `connect_try_again_later` | Please try again later, or select someone else on our website. |
| `generic_goodbye`         | See you soon!                                                  |

Afterwards, we hang up.


### Postpone

When we have successfully initiated a [Scheduled Call](#scheduled-call) to a user, it could still be that we have caught them at a bad time.
For that case, we allow them to choose that they don't have time right now.

This menu is a bit complicated, since it supports several choices and also changes its wording depending on certain conditions.
Basically, there are three options:

* <kbd>1</kbd>: [Snooze](#snooze) the call, asking DearMEP to call again in about 15 minutes. This option is only available once per day; you cannot "re-snooze" a call that has already been snoozed. This is to prevent users from snoozing us indefinitely, causing high call costs without ever talking to a Destination.
* <kbd>2</kbd>: [Skip](#skip) the call, asking DearMEP to call again at the next scheduled day. Depending on whether the User has only one Scheduled Call per week or multiple ones, the wording changes.
* <kbd>3</kbd>: [Unsubscribe](#unsubscribe) from calls. This behaves the same as if the User had pressed <kbd>3</kbd> in the main menu.

Now that you know the options, here are the associated messages:

| ID                       | Message                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `postpone_choice_snooze` | Shall we call you again in about fifteen minutes? Then press 1. |

Again, the "snooze" option only exists if this isn't already the second time we call the User.

If the User has more than one Scheduled Call per week, we say this:

| ID                                  | Message                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `postpone_choice_other_scheduled_1` | If we should only get back to you at the agreed date, |
| `weekday_N`                         | [weekday of next Scheduled Call]                      |
| `postpone_choice_other_scheduled_2` | press 2 or simply hang up.                            |

If the User has only one Scheduled Call per week, we say this instead:

| ID                          | Message                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `postpone_choice_next_week` | If you just want us to get back to you next week, press 2 or just hang up. |

And finally, we close with this:

| ID                         | Message                              |
| -------------------------- | ------------------------------------ |
| `postpone_choice_delete_1` | If you don't want to be called every |
| `weekday_N`                | [today's weekday]                    |
| `postpone_choice_delete_2` | press 3.                             |


### Snooze

If the User has selected <kbd>1</kbd> from the [Postpone](#postpone) menu, we say this and hang up:

| ID                 | Message                         |
| ------------------ | ------------------------------- |
| `postpone_snoozed` | All right, see you in a minute! |

The next time DearMEP goes through its list of scheduled calls (i.e. about 15 minutes later), the User will be called back.
As stated above already, this option is only available once per day.


### Skip

If the User has selected <kbd>2</kbd> from the [Postpone](#postpone) menu, we say this and hang up:

| ID                 | Message                            |
| ------------------ | ---------------------------------- |
| `postpone_skipped` | That's how we do it. See you then! |


### Unsubscribe

This is where we end up when the User has selected <kbd>3</kbd> either from the main menu of a [Scheduled Call](#scheduled-call) or the [Postpone](#postpone) menu.

If the User has only one call scheduled for the week, we don't ask for further confirmation and instead jump to [Unsubscribe All](#unsubscribe-all).

However, if the User has at least two days with calls scheduled, we inquire whether to delete just the one for the current weekday, or all of them.

| ID                     | Message                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `delete_has_others`    | You have at least one other weekly appointment on file with us. |
| `delete_choice_all`    | If you want us to delete all your call appointments, press 1.   |
| `delete_choice_this_1` | If we only should delete the appointment every                  |
| `weekday_N`            | [today's weekday]                                               |
| `delete_choice_this_2` | press  2.                                                       |

Options:

* <kbd>1</kbd>: [Unsubscribe All](#unsubscribe-all)
* <kbd>2</kbd>: [Unsubscribe Today](#unsubscribe-today)


### Unsubscribe All

The User has asked us to unsubscribe from all future Scheduled Calls.
We remove them from the database, play this confirmation, and hang up:

| ID                   | Message                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `delete_all_deleted` | All right. You will no longer receive automatic calls from us. If you want to reactivate automatic calls, you can do so via our website. |
| `generic_goodbye`    | See you soon!                                                                                                                            |


### Unsubscribe Today

The User has asked us to unsubscribe not from all future Scheduled Calls, but only from those for the current weekday.
We remove the entry from the database, play this confirmation, and hang up.

| ID                      | Message                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `delete_this_deleted_1` | All right. We'll no longer call automatically every                                        |
| `weekday_N`             | [today's weekday]                                                                          |
| `delete_this_deleted_2` | Other configured appointments remain. You can view, adjust or delete them via our website. |
| `generic_goodbye`       | See you soon!                                                                              |


### Play Talking Points

To prepare the User for their call, they can press <kbd>5</kbd> in either the [Instant](#instant-call) or [Scheduled](#scheduled-call) Call main menu to listen to talking points.
These are of course very specific to the policy at hand.

DearMEP expects there to be audio named `argument_1` to `argument_8`.
This is currently hard-coded and the number cannot be configured.
If you have less talking points than that, provide short empty audio for the rest.

The arguments will be shuffled (this is not configurable either) and played inside of the following "envelope" of audio messages.
(You should of course change the content of `arguments_campaign_intro` to whatever your campaign is about.)

| ID                          | Message                                                   |
| --------------------------- | --------------------------------------------------------- |
| `arguments_campaign_intro`  | Okay. Here are a few arguments against chat control.      |
| `arguments_choice_cancel_1` | You can press 1 at any time to be contacted directly with |
| `arguments_choice_cancel_2` | [empty in English, other languages might have text here]  |
|                             | [the shuffled talking points]                             |
| `arguments_end`             | All clear? Then press 1 now to be connected.              |

At any point, the User can press <kbd>1</kbd> to jump to [Attempt to Connect](#attempt-to-connect).
If we reach the end of the audio and the User is still not pressing anything, we jump to [No Input](#no-input), as usual.


### No Input

If we expect input from the user, but don't get any for more than 9 seconds (currently hard-coded), we play this and hang up.

| ID                 | Message                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `generic_no_input` | We have not received a selection from you. That is why we are hanging up now. |


### Invalid Input

If we expect input from the user, but they press a button with an invalid option, we play this, followed by repeating the current step's audio.

| ID                      | Message                        |
| ----------------------- | ------------------------------ |
| `generic_invalid_input` | This is not a valid selection. |


### Menu Timeout

If the User spends more than 7 minutes (currently hard-coded) in the menu, we play this and hang up.
There should probably be a dedicated message for it instead.

| ID                        | Message                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `connect_try_again_later` | Please try again later, or select someone else on our website. |
| `generic_goodbye`         | See you soon!                                                  |


## Group Names

The parliamentary groups that existed in the European Parliament in 2023 are listed in the `messages.csv` file.
If you would like to use different group names, make sure to record audio files for it.

The IVR will only use groups of type `parl_group`, i.e. not the `party` of the Destination.

The group name's audio file ID is derived from the group ID by first removing the `G:` prefix if it exists, and then replacing all characters except `a-z` (and `A-Z`) with underscores (`_`).
The result will be converted to lower case, if it's not already.


## File Format

Audio files should be in DearMEP's preferred format, [Ogg Vorbis](https://en.wikipedia.org/wiki/Vorbis).
You can use `dearmep convert audio` to convert them, see the section on [converting audio files](data-conversion.md#converting-the-audio-files) in the data conversion manual.

Files should be named `{id}.{lang}.ogg`, where `id` is one of the IDs listed in the sections above (e.g. `generic_goodbye` or `weekday_3`), and `{lang}` is a language suffix like `de` or `en`.

Technically, the language suffix is not required.
When looking for a file to play, DearMEP will try

1. `{id}.{call_lang}.ogg`, where `{call_lang}` is the language the call is in, i.e. the language the User selected on the website,
2. `{id}.en.ogg`, i.e. the English version of the file, and
3. `{id}.ogg`, i.e. the file without a language suffix

in turn.
First found file wins.
If a file is missing, the behavior is undefined and it's quite possible that DearMEP will simply hang up.


## Importing Files Into the Database

Use `dearmep db store-blob --type ivr_audio FILENAMES` to import them into DearMEP's database.
Make sure to check out `dearmep db store-blob --help` for additional options.


## Additional Files

[`messages.csv`](ivr/messages.csv) lists almost all messages required.
There are a few additional and/or special ones.
Some of them have already been mentioned in previous sections, but here's an overview again:

### Silence

For now, DearMEP requires 100 ms of silence in a file with ID `0.1_silence`.
(It doesn't need a language suffix.)

### Destination Names

The audio files containing the names of Destinations (i.e. MEPs) need to be named after the Destination IDs.
For example, a Destination with ID `96750` requires a file with ID `96750`, i.e. probably named `96750.ogg`.
You _can_, as always, provide different versions for different languages, but it's probably best to just have one version, in the language of the Destination themself.

### Talking Points

As mentioned in [Play Talking Points](#play-talking-points), these are `argument_1` to `argument_8`.
You have to provide all of them.
If you don't have that many arguments, put short silence in the file.

### Blocklist

`messages.csv` also includes some messages prefixed `blocklist_`.
These are in preparation for a feature that is not yet implemented.
You don't have to supply them, but it can't hurt either.


## `compile_messages.py`

There is a script called [`compile_messages.py`](ivr/compile_messages.py), whose original purpose was to take `messages.csv`, add the talking points configured in [`example-config.yaml`](../server/dearmep/example-config.yaml) (in the `l10n.frontend_strings.talkingPoints.points.*` values), and produce a new CSV file as well as an Excel file that you can give to the people recording the audio.

The script should basically still work, but instead of using exactly eight [talking points](#talking-points), it will use as little or as many as there are in the config, which is not what the IVR code expects.

Make sure to read the section on [additional files](#additional-files) and don't blindly rely on the script's output.
