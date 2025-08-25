<!--
SPDX-FileCopyrightText: © 2023 Tim Weber
SPDX-FileCopyrightText: © 2023 iameru

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Converting data for use in DearMEP

This document aims to give you some pointers on where to get the data required to set up DearMEP, and how to convert it into a format

* that can be understood by DearMEP, or
* that can be easily used in your own data pipelines (e.g. for using your own algorithm to calculate an initial swayability score).

We assume that you have installed DearMEP and that it’s available to be invoked using the `dearmep` command.
It is recommended that you install DearMEP with the `convert` extra (e.g. `pip install 'dearmep[convert]'`), because this will provide additional data conversion and exploration tools like [csvkit](https://csvkit.readthedocs.io/) and [VisiData](https://www.visidata.org/).

If you’d like to have a look at a shell script that has been used in an actual campaign, check out [`build-db.sh`](../server/build-db.sh).


## Members of the European Parliament

As you might expect from a project named “DearMEP”, working with MEPs (Members of the European Parliament) is a core use case for us.

[Parltrack](https://parltrack.org/), a European initiative to improve the transparency of legislative processes, provides [dumps](https://parltrack.org/dumps) with information about all of the MEPs.
We support importing these dumps into the system.

This is a two-step process:

* First, we convert the MEP dump into a more general format called _DearMEP Destination Stream_, which is independent of the actual parliament and basically is just a [newline-delimited JSON](https://jsonlines.org/) data stream containing data objects like MEPs and their contact information, parliamentary groups, etc.
* Second, this stream is then used to populate DearMEP’s database. See the section about [importing a Destination Stream](#importing-a-destination-stream) below.

This approach might seem more complicated than it needs to be, but it provides a lot of flexibility to modify the data in the process, using standard tools.

### Converting the MEP dump to a Destination Stream

If you go to [Parltrack’s dumps page](https://parltrack.org/dumps), you will find a `ep_meps.json.zst` file available to download.
It contains all of the past and present MEPs, as well as how to contact them, which parliamentary groups, parties, committees etc. they were a member of, and a few other things.
DearMEP does not (yet) use all of that information, but it supports extracting the information relevant to it.

To create a Destination Stream from the MEP dump, use the `dearmep convert parltrack.meps` command:

```console
$ dearmep convert parltrack.meps ep_meps.json.zst > dearmep-destinations.json
reading and decompressing input ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
parsing JSON                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
converting to DearMEP format    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
```

(Please note that by default `convert parltrack.meps` will only include currently active MEPs.
See `dearmep convert parltrack.meps --help` for how to change that, among other things.)

You can now inspect the resulting NDJSON file, e.g. using `less`, or run any standard tool on it to filter or modify it.

```console
$ head ~/dearmep-destinations.json
{"_dearmep_stream": 1}
{"_dearmep_type": "group", "id": "G:Verts/ALE", "type": "parl_group", "short_name": "Verts/ALE", "long_name": "Group of the Greens/European Free Alliance"}
{"_dearmep_type": "group", "id": "P:r\u00e9gions et peuples solidaires", "type": "party", "long_name": "R\u00e9gions et Peuples Solidaires"}
{"_dearmep_type": "destination", "id": "96750", "name": "Fran\u00e7ois ALFONSI", "country": "FR", "contacts": [{"type": "email", "contact": "francois.alfonsi@europarl.eu"}, {"type": "fax", "group": "brussels", "contact": "+3222849490"}, {"type": "phone", "group": "brussels", "contact": "+3222845490"}, {"type": "fax", "group": "strasbourg", "contact": "+33388179490"}, {"type": "phone", "group": "strasbourg", "contact": "+33388175490"}], "groups": ["G:Verts/ALE", "P:r\u00e9gions et peuples solidaires"], "portrait": "96750.jpg"}
```

As you can see, the file contains entries for each MEP, and will also define the groups they belong to, as needed.

We could import this file now, but let’s do something else with it first:
Extract a list of MEP IDs, in order to download their portrait photos.


## European Parliament MEP portrait photos

The European Parliament provides photos of (nearly) all of the MEPs.
All you need to download a photo is the “MEP ID”, a number that uniquely identifies every past and present MEP.

DearMEP comes with a command to download one or more portrait images into a directory of your choosing:

```console
$ mkdir portraits  # create the directory to hold the files
$ dearmep convert europarl.portraits --filename-template portraits/'{id}.jpg' 96761 197423
downloading portraits ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
$ ls portraits
197423.jpg  96761.jpg
```

Just like that, we’ve downloaded the portraits of two MEPs by entering their IDs on the command line.
The `--filename-template` argument specifies a filename pattern that determines where the resulting images will be saved.
It’s worth reading `dearmep convert europarl.portraits --help` to learn more about other options, for example to specify what to do when the destination file already exists.

### Extracting a list of MEP IDs

Now, entering the IDs of all of the (currently) over 700 MEPs manually might be a bit tedious.
Luckily, the file we created in [the MEP dump section](#converting-the-mep-dump-to-a-destination-stream) contains the ID of each active MEP in a machine-readable format.

We _could_ use plain and simple Unix tools to extract these IDs in a quick-and-dirty way, without even really parsing JSON at all.
For example, by exploiting the string representation of the data, we could ask tried and true `sed` to give us a list of IDs:

```console
$ sed -n -e 's/^{"_dearmep_type": "destination", "id": "\([0-9]*\)".*/\1/p' dearmep-destinations.json
96750
4746
23788
…
```

However, this is brittle and error-prone.
DearMEP’s `[convert]` installation extra, as recommended in the [introduction section](#converting-data-for-use-in-dearmep), brings some more powerful tools to solve the problem in a more stable way:

* [`in2csv`](https://csvkit.readthedocs.io/en/latest/scripts/in2csv.html) to convert a number of formats, including the NDJSON we have, into the simpler CSV format.
* [`csvgrep`](https://csvkit.readthedocs.io/en/latest/scripts/csvgrep.html) to filter CSV files by certain column values, for example to only return objects with a `_dearmep_type` value of `destination`.
* [`csvcut`](https://csvkit.readthedocs.io/en/latest/scripts/csvcut.html) to extract only a subset of columns. Right now, we are only interested in the `id`.

Here’s how this could look like:

```console
$ in2csv -f ndjson dearmep-destinations.json | csvgrep -c _dearmep_type -m destination | csvcut -c id
id
96750
4746
23788
…
```

We’re using a shell pipe to pass the output of one command into the next one.
As you can see, this is basically the same output as above, but we’re now actually handling structured data, not just text.

However, the output of our pipeline is a CSV file, and even though it has only one column (`id`), that column nevertheless comes with a header line (the `id` before the `96750`).
No worries, by adding `| tail -n +2` we can modify our pipe to only output the second line and all that follow it.

### Downloading MEP portraits

Using `xargs` allows us to supply all of the IDs from the previous section to the `dearmep convert europarl.portraits` command.
The pipe runs a few minutes (because it’s not nice to put too much load on the EP server) and looks like this:

```console
$ in2csv -f ndjson dearmep-destinations.json | csvgrep -c _dearmep_type -m destination | csvcut -c id | tail -n +2 | xargs dearmep convert europarl.portraits --filename-template 'portraits/{id}.jpg' --existing skip --not-found ignore
[07/07/23 23:37:32] ERROR    ERROR:dearmep.http_client:404     http_client.py:50
                             when downloading
                             https://www.europarl.europa.eu/me
                             pphoto/236050.jpg, giving up
                    ERROR    ERROR:backoff:Giving up _fetch(...)  _common.py:120
                             after 1 tries
                             (requests.exceptions.HTTPError: 404
                             Client Error: Not Found for url:
                             https://www.europarl.europa.eu/mepph
                             oto/236050.jpg)
downloading portraits ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
```

As you can see, one of the MEPs in our dump doesn’t have a portrait right now, but `--not-found ignore` told DearMEP to simply not create a portrait file for that person.

**Please note:**
The European Parliament requests attribution for using these photos.
See their [legal notice](https://www.europarl.europa.eu/legal-notice/) for more information.

Our `portraits` directory now contains about 40 MB of MEP faces.
The next step would be to import all of them into the DearMEP database.
However, first, let’s download one more image:
The EP’s placeholder, used when there’s no portrait for a person.

The EP server actually serves this image every time you ask for the portrait of a person that doesn’t have one, as well as if the MEP ID doesn’t exist at all.
Technically, the image is a “404 Not Found” error though, so we need to tell DearMEP to save the image regardless by setting `-n save`:

```console
$ dearmep convert europarl.portraits --filename-template portraits/placeholder.jpg -n save 0
downloading portraits ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
```

This command downloaded the (placeholder) portrait for the (non-existing) MEP with ID `0` and saved it as `portraits/placeholder.jpg`.
You could of course use a completely different image as the placeholder, if you wanted to.

We now have everything we need to display the MEPs and their portraits on the website.
However, we still lack one important thing.


## European Parliament MEP name audio

When DearMEP connects a User to a Destination, especially on a scheduled call where the User did not interactively choose their Destination, we need some way to announce the person's name on the phone.
In other words, for each MEP, we need an audio file with their name.

### Downloading MEP name audio

Luckily, the European Parliament provides that as well, and DearMEP has a command to download these files:

```console
$ mkdir names
$ dearmep convert europarl.name-audio --filename-template names/'{id}.mp3' --existing skip --not-found ignore 96750
downloading name audio ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
$ ls names
96750.mp3
```

As you can see, it's basically the same as the portraits we did before.
This also means that we can use the long `in2csv … | csvgrep … | csvcut … | tail … | xargs …` line from before and just replace the `dearmep` invocation to download all names.

Again, it's pretty likely that for some MEPs there won't be a name audio available (yet).
Instead of using a placeholder, you should probably record all of the missing names yourself.

However, in contrast to the portraits, the name audio requires us to take yet another step.

### Converting the audio files

DearMEP's phone call subsystem will create new audio files on the fly that are a concatenation of shorter building blocks.
To do that efficiently, all of the files have to be in the same format.
DearMEP, being open source, prefers open formats.
Therefore, `dearmep convert audio` exists to convert an input file to 44.1 kHz mono [Ogg Vorbis](https://en.wikipedia.org/wiki/Vorbis).
(We would prefer [Opus](https://en.wikipedia.org/wiki/Opus_(audio_format)) even more, but our phone provider 46elks doesn't support it.)

If you have [ffmpeg](https://ffmpeg.org/) installed (which you need anyway to run DearMEP's phone feature), you can simply execute a command like

```console
$ dearmep convert audio names/*.mp3
names/96750.ogg
```

to convert the files.

Are we done?
No, we're _still_ lacking one small ingredient: group logos.


## Group Logos

Each Member of Parliament is usually associated to (at least) two groups:

* their political party (from their home country) and
* a parliamentary group, i.e. a group usually consisting of members from several parties, with similar ideologies.

There are often over 200 parties represented in the European Parliament; collecting all of their logos would be tedious.
(Also, don't forget that some MEPs don't belong to any political party, they are independent.)

However, there are only around 10 parliamentary groups.
Providing a logo for them allows DearMEP to display it alongside MEPs and in search results, which is helpful for users.

**Note:**
DearMEP, despite the name, tries to be flexible when it comes to which groups of people are actually being targeted by the Campaign, whether they belong to the European Parliament or not.
This is why we don't curate and supply EP group logos, you will have to bring your own.
The [DearMEP media repository](https://github.com/AKVorrat/dearmep-media/) contains some group logos that we, the authors, have used in the past.
They are provided on a best-effort basis and may or may not be up to date and/or fitting for the purpose of your Campaign.

To get a list of the groups (which can include characters like `/`) and the file names (which shouldn't), you can extract that information from the Destination Stream we've created above.
We need to filter for objects of type `group`, then select only parliamentary groups (thus excluding parties) and retrieve the two fields we're interested in:

```console
$ in2csv -f ndjson dearmep-destinations.json | csvgrep -c _dearmep_type -m group | csvgrep -c type -m parl_group | csvcut -c long_name,short_name,logo | csvlook
| long_name                                                                                | short_name | logo          |
| ---------------------------------------------------------------------------------------- | ---------- | ------------- |
| Group of the Greens/European Free Alliance                                               | Verts/ALE  | Verts_ALE.png |
| European Conservatives and Reformists Group                                              | ECR        | ECR.png       |
| Group of the European People's Party (Christian Democrats)                               | PPE        | PPE.png       |
| Group of the Progressive Alliance of Socialists and Democrats in the European Parliament | S&D        | S_D.png       |
| Renew Europe Group                                                                       | RE         | RE.png        |
| Non-attached Members                                                                     |            | NA.png        |
| The Left group in the European Parliament - GUE/NGL                                      | GUE/NGL    | GUE_NGL.png   |
| Identity and Democracy Group                                                             | ID         | ID.png        |
```

As you can see, DearMEP suggests PNG files, but SVGs would probably work, too.
Get these logos from somewhere, place them in a sensible location (e.g. a `logos` subdirectory), and we finally have all we need to import a Destination Stream.


## Importing a Destination Stream

This section expects you to bring a [Destination Stream JSON](#converting-the-mep-dump-to-a-destination-stream), a [directory with portrait images](#downloading-mep-portraits), a [directory with group logos](#group-logos), and a [directory with name audio](#downloading-mep-name-audio).
Go back to the previous sections if you don’t have these.
(Although technically you can run the import without any images or audio.)

### Setting up the database

DearMEP uses a relational database to keep track of all the information it needs.
You can either use a database server like [PostgreSQL](https://www.postgresql.org/) or [MariaDB](https://mariadb.org/), or use a local [SQLite](https://www.sqlite.org/) database file.
The latter is significantly easier to setup and maintain, but performs slightly worse and cannot run in any kind of clustered or load-balanced environment.
For this tutorial, we like to keep things easy, so we’re going with SQLite.
We have been running a campaign with SQLite with no problems though, don't underestimate it.

To access the database, DearMEP needs to know where it’s located, and we’re using a [YAML](https://en.wikipedia.org/wiki/YAML) config file to provide that information.
DearMEP can provide you with an example config to customize:

```console
$ dearmep dump example-config > dearmep-config.yaml
```

Have a look at that file, it should contain detailed comments and explanations.
When you scroll to the `database` section, you should see a `url` setting.
This is a [SQLAlchemy database URL](https://docs.sqlalchemy.org/en/20/core/engines.html), and you can point it to a database server as well as a local SQLite file.
In fact, the example config should have this setting point to a file called `dearmep.sqlite`.

So, let’s ask DearMEP to set up a fresh database.

```console
$ dearmep alembic upgrade head
The configuration file was not found. This usually means that you did not set the DEARMEP_CONFIG environment variable to the config file name, or its path is incorrect.
Traceback (most recent call last):
…
```

That didn’t work.
See, you not only need a configuration file, you also need to _tell_ DearMEP where to _find_ it.
By default, it will look for a file named `config.yaml` in the current directory.
Since we named ours differently (yes, of course this was for demonstration purposes), we need to set the environment variable `DEARMEP_CONFIG` to the path to this file.
This can be done by prefixing the `dearmep` command with it, e.g. `DEARMEP_CONFIG=dearmep-config.yaml dearmep alembic upgrade head`, but you’d need to do it every time you invoke DearMEP.

The easier way is probably to execute `export DEARMEP_CONFIG="$(pwd)/dearmep-config.yaml"` once.
This setting will persist while you’re logged in to your current shell.
If you want to set it even more permanently, you can either add it to your shell’s profile (which is out of scope for this document), or use [a `.env` file](https://pypi.org/project/python-dotenv/).
For this, create a file called `.env` and write `DEARMEP_CONFIG=dearmep-config.yaml` into it.

Now, initializing the database should work:

```console
$ dearmep alembic upgrade head  # no output means nothing went wrong
$ ls -lh dearmep.sqlite
-rw-r--r-- 1 scy scy 64K Jul  8 14:13 dearmep.sqlite
```

This database is still empty, only its tables have been created, but they haven’t been filled with any data.
Let’s change that now.

### Actually importing the Destinations

The `dearmep import destinations` command takes a Destination Stream (and possibly some other data, like the portraits) and imports them into the configured database.

**Note:**
Right now, the command is designed to import into an **empty** database **only**.
Importing the same stream twice will not work, as all of the IDs already exist, causing the import to stop with uniqueness constraint errors.
This will probably change in the future.

The actual import command is rather simple:

```console
$ dearmep import destinations --portrait-template 'portraits/{id}.jpg' --fallback-portrait portraits/placeholder.jpg --logo-template 'logos/{filename}' --name-audio-template 'names/{id}.ogg' dearmep-destinations.json
reading and converting JSON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
$ ls -lh dearmep.sqlite
-rw-r--r-- 1 scy scy 44M Jul  8 14:25 dearmep.sqlite
```

* `--portrait-template` basically corresponds to the `--filename-template` option of the `dearmep convert europarl.portraits` command: It tells the importer how to derive a portrait filename from the MEP ID.
* `--fallback-portrait` will be used if the filename that resulted from `--portrait-template` does not exist.
* When importing a group, `--logo-template` will be evaluated into a file name; if that file exists, it will be used as the group logo. If it doesn't, that group won't have a logo. `{filename}` corresponds to the `logo` field in the stream.
* `--name-audio-template` works like `--portrait-template`, but for the audio files containing the MEP names.
* `dearmep-destinations.json` points to the Destination Stream to import.

The placeholders in the `--<something>-template` options will be replaced as explained in `dearmep import destinations --help`.
For example, `--portrait-template` understands `{filename}` (which will be replaced with the value in the `portrait` field in the Destination object in the stream), and `{id}` (which will be replaced by the Destination object's ID).

Different options support different placeholders, for example to allow you to use different file names than the ones suggested in the stream.
For example, if you wanted to use SVG logos instead of PNG, you could either replace the file names in the stream, or use something like `--logo-template 'logos/{short_name}.svg'`.
Do note that the `short_name` contains characters like `/` and `&` though, which might make this troublesome.

Finally, after running the import command, the database is now filled and ready to use.
You could run `dearmep serve` and then access <http://localhost:8000/api/v1/destination/suggested> to retrieve a Destination that DearMEP is suggesting you to contact.

----

The rest of this document deals with other data formats and converters that DearMEP supports, and that may help you set up your campaign, calculate swayability scores etc.

## European Parliament roll-call vote results

The European Parliament provides [roll-call vote results](https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes) as XML files.
DearMEP can help you extract the results of a particular vote, and convert it to an easier format.

For example, let’s download the [roll-call vote results from July 6 2021](https://www.europarl.europa.eu/doceo/document/PV-9-2021-07-06-RCV_FR.xml).
This XML contains the results of all of the plenary votes that took place on that day.
You can use DearMEP to retrieve a list of all of the voting topics contained in that file:

```console
$ dearmep convert europarl.rollcallvote topics PV-9-2021-07-06-RCV_FR.xml
┏━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ID     ┃ Description                                                         ┃
┡━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ 134463 │ Utilisation de technologies pour le traitement de données aux fins  │
│        │ de la lutte contre les abus sexuels commis contre des enfants en    │
│        │ ligne (dérogation temporaire à la directive 2002/58/CE) - Use of    │
│        │ technologies for the processing of data for the purpose of          │
│        │ combating online child sexual abuse (temporary derogation from      │
│        │ Directive 2002/58/EC) - Verwendung von Technik zur Verarbeitung von │
│        │ Daten zwecks Bekämpfung des sexuellen Missbrauchs von Kindern im    │
│        │ Internet (vorübergehende Ausnahme von der Richtlinie 2002/58/EG) -  │
│        │ A9-0258/2020 - Birgit Sippel - Am 39                                │
│ 134542 │ Reconnaissance des certificats de pays tiers dans le domaine de la  │
│        │ navigation intérieure - Recognition of third countries certificates │
│        │ in inland navigation - Anerkennung von Zeugnissen aus Drittländern  │
│        │ in der Binnenschifffahrt - A9-0210/2021 - Andris Ameriks - Vote     │
│        │ unique                                                              │
│ 134562 │ Projet de budget rectificatif n° 3/2021: excédent de l’exercice     │
│        │ 2020 - Draft amending budget No 3/2021: surplus of the financial    │
…
```

Suppose you’re interested in the results of the first topic in that list.
Again, you can use DearMEP for that:

```console
$ dearmep convert europarl.rollcallvote votes -t 134463 PV-9-2021-07-06-RCV_FR.xml
┏━━━━━━━━┳━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━┓
┃ PersID ┃ MEPID ┃ Group     ┃ Name                      ┃ Vote ┃
┡━━━━━━━━╇━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━┩
│ 198096 │ 7244  │ ECR       │ Aguilar                   │ +    │
│ 197478 │ 6875  │ ECR       │ Berg                      │ +    │
│ 4746   │ 4978  │ ECR       │ Berlato                   │ +    │
…
```

This table contains, for each MEP that took part in the vote, whether they voted for (designated by a `+`) or against (`-`) the proposal, or abstained from voting (`0`).
The table is not sorted by DearMEP; the votes are listed in the order they have in the XML (which is usually sorted first by vote, then group, then name).

Now, if you want to do any kind of further filtering or correlating with that data, you need it in a better format than a “ASCII art” style table on the screen.
Fortunately, both of the `europarl.rollcallvote` converters support the option `-f csv` to write CSV data instead.
By default, the CSV output will be written to stdout (i.e. your terminal); if you’d like to have it written to a file instead, use your shell’s redirection feature:

```console
$ dearmep convert europarl.rollcallvote votes -f csv -t 134463 PV-9-2021-07-06-RCV_FR.xml > votes.csv
$ head -n 4 votes.csv
PersID,MEPID,Group,Name,Vote
198096,7244,ECR,Aguilar,+
197478,6875,ECR,Berg,+
4746,4978,ECR,Berlato,+
```

This CSV file can now be imported into a spreadsheet, or further manipulated using any other tool you like.
For example, to count the vote results with csvkit:

```console
$ csvstat -c Vote votes.csv
  5. "Vote"

        Type of data:          Text
        Contains null values:  False
        Unique values:         3
        Longest value:         1 characters
        Most common values:    + (537x)
                               - (133x)
                               0 (24x)

Row count: 694
```
