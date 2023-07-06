# Converting data for use in DearMEP

This document aims to give you some pointers on where to get the data required to set up DearMEP, and how to convert it into a format

* that can be understood by DearMEP, or
* that can be easily used in your own data pipelines (e.g. for using your own algorithm to calculate an initial swayability score).

We assume that you have installed DearMEP and that it’s available to be invoked using the `dearmep` command.
It is recommended that you install DearMEP with the `convert` extra (e.g. `pip install 'dearmep[convert]'`), because this will provide additional data conversion and exploration tools like [csvkit](https://csvkit.readthedocs.io/) and [VisiData](https://www.visidata.org/).

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
