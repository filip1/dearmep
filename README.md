<!--
SPDX-FileCopyrightText: © 2022 Tim Weber
SPDX-FileCopyrightText: © 2024 Tobias Mühlberger

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# ☎️ DearMEP

> **Empowering citizens to directly and easily reach out to their Members of the European Parliament (MEPs), amplifying public voices in critical legislative debates.**

---

## 🚀 Overview

Many impactful decisions are made in Brussels and Strasbourg, yet these processes often feel distant to citizens. **DearMEP** bridges that gap by enabling citizens and NGOs to efficiently connect with MEPs — without needing to navigate the complexities of EU politics or hunt for contact information.

### How It Works

DearMEP is embedded as a widget within campaign pages to make it **incredibly simple** for citizens to contact their representatives.

1. **Contact Suggestion**: Upon visiting a campaign page, the DearMEP widget automatically selects an MEP from your country who is most likely to be persuaded. Users can change this selection if desired.

2. **Direct Calling**: With one click, you can start a call. Your phone will ring, connecting you to an MEP at no cost. DearMEP provides suggested talking points for your conversation.

3. **Feedback Loop**: After calls, users can provide feedback on their interactions, which helps refine future contact recommendations dynamically.

For those who prefer not to call, other contact options (e.g., email addresses, social media links) are available. Users still benefit from the smart MEP selection even in these cases.

[**Learn more on our website**](https://dearmep.eu) 🌍

---

## 📸 Demo

> Watch DearMEP in action: [Conference Talk & Demo](https://dearmep.eu/concept/)

[![Video thumbnail for the conference talk](doc/img/dear-mep-talk-thumb.png)](https://dearmep.eu/concept/)

Try the live instance [here](https://dearmep.eu/showcase/chatcontrol/) (Note: This link directs to the live instance from the Chat Control campaign).

---

## ✨ Key Features

- **Instant Calling**: Connect with an MEP with just one click.
- **Call Scheduling**: Power users can schedule recurring calls.
- **Smart MEP Selection**: Focuses contact efforts on the most persuadable MEPs based on voting history and user feedback.
- **No Expertise Required**: No need to understand EU procedures or search for contact details.
- **Multi-Language Support**: Detects your browser’s language and adjusts automatically. Manual language selection is also available.
- **Strong Privacy Focus**: We take privacy very seriously. We tried to minimize data processing following privacy-by-design and privacy-by-default principles.
- **Seamless Integration**: Easily embed DearMEP as a widget into any campaign website, with customizable themes.
- **Reusable & Open Source**: Adaptable for any EU campaign.

---

## 🛠️ Getting Started

DearMEP is a white-label solution that can be tailored for any EU legislative issue. **NGOs and activists** can deploy this tool to mobilize communities and influence parliamentary decisions.

### Using an Existing Instance

To add DearMEP to your campaign page using an existing instance, simply copy a few lines of HTML. First, ask the instance administrator to add your campaign site’s URL to the allowed origins on the DearMEP server. Then, paste the HTML snippet into your page.

More details can be found in the [client README](./client/README.md).

### Setting Up a New Instance

Setting up a new instance requires additional steps, including configuring the server and preparing a list of MEPs. This repository includes example configurations and scripts to simplify the process. Additionally, you’ll need an account with [46elks](https://46elks.com/), which serves as the calling provider.

Further setup instructions are available in the [server README](./server/README.md).

---

## 📚 Documentation

Get started quickly and explore all aspects of this project with our detailed documentation:

### Core Documentation

- [Server README](./server/README.md): Discover how to set up the server, maintain the database, and manage a development environment.
- [Client README](./client/README.md): Learn how to embed the client application, how to customize it, as well as build and development steps.

### Additional Resources

- [Glossary](./doc/glossary.md): Key terms and concepts used throughout the project.
- [Data Protection & Privacy](./doc/data-protection.md): Understand how we handle sensitive data and protect the privacy of our users.
- [Security](./doc/security.md): Measures we take to ensure the security of our software.
- [Converting Data](./doc/data-conversion.md): Steps to convert European Parliament data for use with DearMEP.
- [Theming](./doc/theming.md): Tailor the client design to match your campaign’s homepage design.
- [DearMEP Prometheus Metrics](./doc/metrics.md): Metrics that let you know what is going on with a production instance.
- [Selecting Destinations](./doc/selecting-destinations.md): How DearMEP suggests who to call.
- [Interactive Voice Response (IVR)](./doc/ivr.md): Describes the structure of the voice menu that our users interact with over the phone.
- [Scheduler](./doc/scheduler.md): The internals of how we are scheduling calls.
- [API Documentation](https://redocly.github.io/redoc/?url=https://akvorrat.github.io/dearmep/openapi.json) (OpenAPI ReDoc): Detailed API reference for advanced integrations and custom client implementations.

---

## 🆘 Support

If you need help setting up DearMEP, have questions, or found a bug, there are several ways to contact us:

- [GitHub Discussions](https://github.com/AKVorrat/dearmep/discussions) for general Q & A.
- [GitHub Issues](https://github.com/AKVorrat/dearmep/issues) for bugs and contributions.
- Our [public chat](https://signal.group/#CjQKIIvA-iVKQh2KW5Y5Ng8jaYsgd9ScDmQkUkJLuZ1mSG3yEhDUzv3WmAAVHkm6d-cLpy50) on [Signal](https://signal.org/).

Some of the people behind DearMEP are also available for paid consulting services and feature development.
Contact us and let us know what you need.

---

## 🛡️ License

This project is licensed under the **AGPL License**. See the [`LICENSE.md`](LICENSE.md) file for details.

---

## 🤝 Contributing

We appreciate contributions from the community!

Before you get started, please take a moment to review our [contribution guidelines](CONTRIBUTING.md).

Ideally discuss your planned contributions with members of the core team in a GitHub Issue beforehand.

Thank you for helping us make this project better! 🚀

---

## 👥 Meet the Team
To learn more about the people behind this project, visit our [team page](https://dearmep.eu/team/).
