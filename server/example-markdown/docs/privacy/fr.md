<!--
SPDX-FileCopyrightText: © 2023 aura

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# DearMEP CSAR (Règlement en vue de prévenir et de combattre les abus sexuels sur enfants) Règles de confidentialité

Car votre vie privée est importante pour nous, nous prenons donc très sérieux notre devoir de vous informer sur notre façon d'utiliser vos données.

Responsable du traitement de cette instance du logiciel DearMEP:

```
epicenter.works - Plattform Grundrechtspolitik
Linke Wienzeile 12/19
1060 Vienne, Autriche
office@epicenter.works
```

Coordonnées du responsable de la protection des données chez epicenter.works: <dsba@epicenter.works>

Vous avez le droit d'être informé sur vos données personnelles (article 15 du RGPD), de les faire corriger (article 16 du RGPD), de les faire effacer (article 17 du RGPD) ou d'en limiter le traitement (article 18 du RGPD), de vous opposer au traitement (article 21 du RGPD) et de demander la portabilité des données (article 20 du RGPD).
Vous pouvez envoyer vos demandes à l'adresse suivante : <office@epicenter.works>.
Vous avez également le droit de vous plaindre auprès d'une autorité de supervision, en Autriche c'est l'Autorité de protection des données (<https://www.dsb.gv.at>).

Comme informations personnelles identifiables, nous traitons l'adresse IP des utilisateurs qui se connectent à l'outil, le numéro de téléphone pour les appels individuels ou programmés et, éventuellement, toute information personnelle que l'utilisateur choisit de partager par le formulaire de feedback.
Nous expliquons plus en détail les différents cas de traitement dans les paragraphes qui suivent:

## Accès au site web

Lors de l'accès à l'outil DearMEP, l'adresse IP de l'utilisateur est traitée sur notre serveur, qui est situé en Europe.
L'objectif du traitement des adresses IP est de géolocaliser l'utilisateur dans un pays et de prévenir les abus.
La géolocalisation associe le défaut de la sélection du pays à la localisation de la connexion internet de l'utilisateur.
Cette opération s'effectue localement sur notre serveur, dans la RAM, votre adresse IP n'est pas communiquée à un parti tiers.
Afin de garantir l'intégrité et la stabilité du service, nous retenons l'adresse IP pour nous permettre de limiter l'accès à nos serveurs pour prévenir les abus.
La limitation du débit s'effectue dans la RAM du serveur et n'est conservée que pour la durée de fonctionnement ininterrompue du service.
De plus, notre serveur enregistre également les 16 premiers bits de l'adresse IPv4 et les 96 premiers bits de l'adresse IPv6 pendant la durée de la campagne ou, en cas d'abus, pendant la durée de toute procédure pénale ultérieure.
La base juridique de ce traitement est notre intérêt légitime (article 6, paragraphe 1, point f), du RGPD) et nos obligations légales (article 6, paragraphe 1, point c), du RGPD).

## Utilisation du service téléphonique

Quand vous utilisez notre service pour faire des appels téléphoniques, nous vous demandons de donner votre accord à ces règles de confidentialité pour que nous puissions traiter votre numéro de téléphone.
Nous n'obtenons ni traitons d'informations sur le contenu de vos conversations téléphoniques à partir du moment où notre système vous a mis en contact avec le membre du Parlement européen.
Nous utilisons le fournisseur suédois 46Elks pour gérer les conversations téléphoniques, par conséquent sa politique de confidentialité s'applique aux appels et aux SMS (<https://46elks.com/privacy-policy>).

Dans des cas particuliers, nous conservons également des données supplémentaires nécessaires pour empêcher l'utilisation frauduleuse du service.
Il peut s'agir d'informations telles que les adresses IP, les numéros de téléphone et le contenu des messages.
Ces informations peuvent également être collectées au sujet de non-utilisateurs, mais toujours dans le but de prévenir les abus.

Notre service ne traite les numéros de téléphone qu'après que vous avez donné votre consentement en connaissance de ces règles de confidentialité et seulement s'il existe un besoin concret de traitement de ces numéros.
La base juridique du traitement des numéros de téléphone est le consentement informé (article 6, paragraphe 1, point a), du RGPD).

Nous avons construit ce système de la sorte que, dans la plupart des cas, nous ne connaissons même pas votre numéro de téléphone.

Les numéros de téléphone stockés dans notre système sont, à quatre exceptions, hachés (<https://en.wikipedia.org/wiki/Hash_function>) pour limiter les risques pour la confidentialité des utilisateurs en cas de compromission du serveur.
Les numéros de téléphone non hachés ne sont conservés qu'une fois, jusqu'à ce qu'ils soient confirmés par un code SMS, et tant qu' / que:
1) il y a un abonnement d'appel en continu qui n'a pas été annulé,
2) lorsqu'un appel individuel est lancé via l'interface web et si cet appel est en cours,
3) un SMS contenant une évaluation n'a pas été envoyé (voir ci-dessous) ou
4) lorsqu'il existe un soupçon raisonnable qu'un numéro puisse abuser de notre système.

Nous traitons les numéros de téléphone dans le cas où des appels individuels sont réalisés avec notre système vers un politicien / une politicienne sélectionné/e ou quand il y a un abonnement d'appel actif dans lequel l'utilisateur demande que notre système l'appelle et le connecte à un politicien /une politicienne de son pays à un jour de semaine donné et à une heure donnée.
Les abonnements peuvent être annulés par l'utilisateur à tout moment via l'interface web ou directement dans l'appel téléphonique prévu, en appuyant sur une touche.

La première étape du traitement des numéros de téléphone consiste à envoyer un code de vérification par SMS pour confirmer que le numéro de téléphone entré dans notre système est contrôlé par l'utilisateur.
Les codes de vérification par SMS qui n'ont pas encore été utilisés sont supprimés au maximum d'une heure.
Nous avons limité le nombre de tentatives de demande de vérification d'un numéro de téléphone et nous conservons donc les numéros qui n'ont pas été confirmés dans un format haché, avec le nombre de tentatives de demande d'un code de vérification.
Nous conservons ces informations pendant toute la durée de la campagne ou, en cas d'abus, pendant toute la durée d'une éventuelle procédure pénale postérieure, afin d'empêcher le spamming de numéros de téléphone de tiers avec des SMS de confirmation.

Un numéro de téléphone confirmé créera un jeton web dans un cookie pour valider la session du navigateur web avec laquelle l'utilisateur interagit avec notre service.
Le numéro de téléphone est conservé dans le cookie qui est envoyé au navigateur de manière cryptée, afin que le décryptage du numéro de téléphone réel ne soit possible que par le serveur.
Les informations d'authentification sont enregistrées dans un cookie de session et sont supprimées dès que la session du navigateur finit.

Pour des raisons de contrôler les coûts et le débogage, nous conservons des informations statistiques anonymes sur le moment, la durée, la destination et le numéro de téléphone tronqué de l'utilisateur.
Nous pouvons partager ces informations statistiques anonymes avec les campagnes qui mettent en œuvre cette version particulière de DearMEP pour le dossier du CSAR, afin qu'elles puissent évaluer l'impact de l'outil au niveau politique.

En cas de suspicion d'abus, nous pouvons ajouter la version hachée d'un numéro de téléphone à un schéma de capture dans notre système.
Dans ce cas, le numéro de téléphone est conservé sans être haché lorsqu'il est à nouveau utilisé dans notre système.
Le numéro de téléphone ne sera traité que pendant la durée de la campagne ou, en cas d'abus, pendant la durée de toute procédure pénale qui s'ensuivrait (article 6, paragraphe 1, points c) et f), du RGPD).

## Feedback d'appel

À la fin d'un appel conclu et après un certain temps s'est passé, l'utilisateur et invité à nous faire part de ses remarques sous la forme d'un lien unique vers une brève évaluation concernant l'appel particulier.
Nous pouvons lui demander ce commentaire directement dans le logiciel de navigation ou par l'intermédiaire d'un message SMS contenant un lien unique.
Nous demandons à l'utilisateur s'il ou elle pense d'avoir réussi à convaincre le politicien, s'il y avait un problème technique et s'il ou si elle a eu d'autres remarques volontaires.

Ces informations sont complétées par le nom du politicien, le pays de l'utilisateur, le numéro de téléphone haché et les premiers chiffres de son numéro de téléphone, qui ne révèlent que l'indicatif du pays et le nom de l'opérateur, mais pas le nom de l'utilisateur. Nous gardons le numéro de téléphone haché afin de pouvoir corréler les réponses avec le même utilisateur.

Le feedback d'appel reste intentionnellement anonyme afin de permettre le partage de ces informations avec les campagnes qui mettent également en œuvre cette version de DearMEP sans révéler d'informations personnelles sur les utilisateurs.

Dans l'interface de l'outil de feedback, l'utilisateur est informé que s'il ou si elle veut être contacté/e par nous, il ou elle doit entrer ses coordonnées dans la partie du feedback optionnel.
Si l'utilisateur donne des informations personnelles telles qu'une adresse électronique ou un numéro de téléphone dans cette zone de texte, nous nous appuyons sur son consentement éclairé comme base juridique de ce traitement (article 6, paragraphe 1, point a), du règlement RGPD).

## Transmission à des parties tierces

Principalement, nous ne transmettons pas vos informations à des tiers sans votre accord explicite.
Lorsque vous utilisez la fonction d'appel, nous devons communiquer votre numéro de téléphone à notre opérateur téléphonique 46Elks (voir plus haut).
Quand cette version de DearMEP pour la législation sur la CSAR est mise en œuvre par les campagnes qui travaillent sur cette législation, nous leur donnerons généralement accès au retour d'appel pseudomisé (qui peut contenir des informations personnelles que vous entrez dans la zone de texte "feedback volontaire") et à des informations statistiques anonymisées sur l'utilisation de cet outil.
Vous pouvez trouver des informations sur les campagnes qui implémentent cette version de DearMEP à <https://dearmep.eu/showcase/chatcontrol/>.
