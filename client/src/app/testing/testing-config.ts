// SPDX-FileCopyrightText: © 2024 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AppConfig } from '../services/config/app-config.model';

export const testingConfig: AppConfig = {
  language: {
    available: ['en', 'de', 'sv', 'fr', 'da', 'pt'],
    recommended: 'en',
    user_preferences: ['en-US', 'en', 'de'],
  },
  location: {
    available: [
      'AT',
      'BE',
      'BG',
      'CY',
      'CZ',
      'DE',
      'DK',
      'EE',
      'ES',
      'FI',
      'FR',
      'GR',
      'HR',
      'HU',
      'IE',
      'IT',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SE',
      'SI',
      'SK',
    ],
    country: 'DE',
    recommended: 'DE',
    db_result: {
      country: {
        iso_code: 'DE',
      },
    },
    ip_address: '89.163.131.159',
  },
  frontend_strings: {},
  features: {
    maintenance: {
      active: true,
      message: {
        dismissable: true,
      },
    },
  },
  office_hours: {
    call_schedule_interval: 15,
    timezone: 'Europe/Brussels',
    weekdays: {
      '1': [
        {
          begin: '09:00:00',
          end: '20:00:00',
        },
      ],
      '2': [
        {
          begin: '09:00:00',
          end: '20:00:00',
        },
      ],
      '3': [
        {
          begin: '09:00:00',
          end: '20:00:00',
        },
      ],
      '4': [
        {
          begin: '09:00:00',
          end: '20:00:00',
        },
      ],
      '5': [
        {
          begin: '09:00:00',
          end: '20:00:00',
        },
      ],
    },
  },
  availableCallingCodes: {
    BE: '+32',
    BG: '+359',
    CZ: '+420',
    DK: '+45',
    DE: '+49',
    EE: '+372',
    IE: '+353',
    GR: '+30',
    ES: '+34',
    FR: '+33',
    HR: '+385',
    IT: '+39',
    CY: '+357',
    LV: '+371',
    LT: '+370',
    LU: '+352',
    HU: '+36',
    MT: '+356',
    NL: '+31',
    AT: '+43',
    PL: '+48',
    PT: '+351',
    RO: '+40',
    SI: '+386',
    SK: '+421',
    FI: '+358',
    SE: '+46',
  },
};
