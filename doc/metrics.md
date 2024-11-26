<!--
SPDX-FileCopyrightText: © 2024 Tim Weber

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# DearMEP Prometheus Metrics

The [DearMEP backend](../server) exports a number of [Prometheus](https://prometheus.io/) metrics in order to allow admins to gain insight about the health of the system, as well as some general statistics.

DearMEP is using the [`starlette-exporter` Python library](https://pypi.org/project/starlette-exporter/) for this, which comes with a set of metrics for the HTTP requests served, as well as the usual Python metrics provided by the [Prometheus Python library](https://prometheus.github.io/client_python/).
In addition to that, we provide a couple of custom metrics.
As usual, they have [`HELP` texts](https://prometheus.io/docs/instrumenting/exposition_formats/#comments-help-text-and-type-information) and thus are self-documenting, but this document provides some additional information about them, as well as the associated labels.



## General

### `http_ratelimit_total` counter

DearMEP provides configurable rate limiting to combat abuse of the system.
Each time a request is checked by the rate limiting system, this counter gets increased.

You can use it to a degree to track the number of HTTP requests, but its real value lies in setting an alert on `result=hit`.
That way you can find out when users are being denied access to the system, and investigate whether that's because your instance is extraordinarily popular, or being attacked.

* `method`: The HTTP request method being used, e.g. `GET`.
* `path`: The route being accessed, with variable parts _not_ being replaced. For example, the literal string `/api/v1/blob/{name}` will be used when any blob (like a picture or sound file) is being accessed. In order to not create large numbers of time series, this path does not include the actual name of the blob.
* `result`: Either `pass` (the request passed the rate limit check, i.e. was allowed) or `hit` (the request was considered to be breaking the rate limit and therefore denied).

### `l10n_autodetect_total` counter

This counter increments for each language/country auto-detection being done.
Those are usually performed whenever a user is opening the frontend.
The metric can help you determine where your users are coming from and which language they are speaking, or, to be more precise, which language they were presented with when accessing the frontend, and which country they had been assigned initially.

* `language`: The language that has been detected as being the most appropriate for the request. This is one of the values in the `l10n.languages` list in DearMEP's configuration file.
* `country`: The country that has been detected as the origin of the request.



## Phone Calls

### `call_cost_euros` summary

Tracks the costs reported by the phone provider after completing a call.
You can use this to track total or average cost, or find out how much it cost you in total to call a certain person.

* `provider`: The phone provider being used (e.g. `46elks`).
* `destination_id`: The ID of the person (i.e., the MEP) being called.

### `call_duration_seconds` summary

Tracks the number of seconds a user was connected to a destination.
You can use this for example to track average or total conversation length.

* `provider`: The phone provider being used (e.g. `46elks`).
* `destination_id`: The ID of the person (i.e., the MEP) being called.

### `call_end_total` counter

The number of calls ended.
Useful to track how often a certain destination has been called, and which of our available phone numbers we were using to call them.
See also `call_start_total`.

* `provider`: The phone provider being used (e.g. `46elks`).
* `destination_number`: The phone number of the person (i.e., the MEP) being called.
* `our_number`: The source number (i.e. what the other person will have displayed as our caller ID) being used.

### `call_in_menu_limit_reached_total` counter

How often we disconnected a user because they were spending too much time in the IVR menu.
This time is currently hardcoded (`menu_duration_timeout`) to 7 minutes.

* `provider`: The phone provider being used (e.g. `46elks`).

### `call_start_total` counter

The number of calls initiated.
Useful to track how often a certain destination has been called, and which of our available phone numbers we were using to call them.
See also `call_end_total`.

* `provider`: The phone provider being used (e.g. `46elks`).
* `destination_number`: The phone number of the person (i.e., the MEP) being called.
* `our_number`: The source number (i.e. what the other person will have displayed as our caller ID) being used.

### `queued_tasks_total` counter

The number of scheduled calls that have been queued.
This counter gets increased every time DearMEP decides that it's time to perform a scheduled call.

Note that this is not a gauge:
The counter does _not_ indicate how many scheduled calls are currently waiting to be performed, it is not a "queue size".

No labels.

### `scheduler_exceptions_total` counter

The number of exceptions occurring in scheduled tasks (i.e. scheduled phone calls).
Set an alert on this, because it should be zero during normal operation.

* `task_name`: Name of the task function in the source code that failed.

### `sms_cost_euros` summary

Cost of SMS messages being sent, in Euros, as reported by the provider after sending a message.

* `provider`: The phone provider being used (e.g. `46elks`).
* `country`: The destination country code prefix, e.g. `49` for Germany.

### `sms_parts_sent_total` counter

Total number of SMS message parts sent.
If a SMS message is too long, it will be split into multiple parts.
This counter increases by one for each of these parts.
See `sms_sent_total` if you're interested in the number of messages instead.

Ideally, this number should be the same as `sms_sent_total`, if your messages are short enough to fit into a single part.
If they're not, you might be spending more on SMS messages than you'd like.

* `provider`: The phone provider being used (e.g. `46elks`).
* `country`: The destination country code prefix, e.g. `49` for Germany.

### `sms_sent_total` counter

Total number of SMS messages sent.
Note that if a message is too long, it will be split into multiple parts.
Nevertheless, this counter only increases by one, no matter how many parts were sent.
See `sms_parts_sent_total` if you're interested in the number of parts.

* `provider`: The phone provider being used (e.g. `46elks`).
* `country`: The destination country code prefix, e.g. `49` for Germany.
